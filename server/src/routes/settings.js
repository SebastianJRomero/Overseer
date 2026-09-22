/*
  routes/settings.js — Config del gimnasio, notificaciones y respaldos.

  Espejan la PARTE de services/settingsService.js que es dato del negocio:
    GET   /settings/gym            → gymInfo                (getGymInfo)
    PATCH /settings/gym            → gymInfo (body {key,value})   (setGymField)
    GET   /settings/network        → { port, host, primary, ips }  (para conectarse
                                                                    desde otro equipo)
    GET   /settings/notifications  → notifications          (getNotifications)
    PATCH /settings/notifications  → notifications (body {key,on}) (setNotification)
    GET   /settings/backup         → backup                 (getBackup)
    PATCH /settings/backup         → backup (body {auto})    (setAutoBackup)
    POST  /settings/backup/run     → backup (crea copia real) (runBackup)
    GET   /settings/backup/files   → { files }               (listBackups)
    GET   /settings/backup/files/:name → descarga la copia
    DELETE /settings/backup/files/:name → borra la copia

  La APARIENCIA (accent/density/roundness) y los FLAGS de módulos NO están aquí:
  siguen en localStorage del front (decisión #2: el tema se persiste local; y
  ambos se leen al arrancar, sin depender del servidor). GYM_FIELDS es constante
  estática de UI y también se queda en el front.

  Guardado: tabla `settings` (clave → JSON). Solo se guardan los valores
  cambiados; al leer se mezclan con los defaults (por si falta alguno).
*/

import { Router } from 'express';
import { db } from '../db.js';
import { lanIps, primaryIp } from '../lib/network.js';
import { createBackup, listBackups, deleteBackup, backupPath, restoreBackup } from '../lib/backup.js';
import { markSeeded } from '../seed.js';

const router = Router();

/* Defaults = los del prototipo (mismos que el mock). */
const DEFAULT_GYM = {
  nombre: 'OVERSEER Fitness Club', direccion: 'Cra 43A #7-50, Medellín',
  telefono: '+57 604 444 8890', correo: 'contacto@overseer.gym',
  horarioSem: '05:00 — 22:00', horarioFin: '07:00 — 14:00',
  moneda: 'COP ($)', zona: 'GMT-5 · Bogotá',
};
const DEFAULT_NOTIFICATIONS = {
  rem3: true, remDay: true, stockLow: true, dailySummary: false,
  chWhats: true, chMail: true, chSms: false,
};
const DEFAULT_BACKUP = { auto: true, last: '', lastFile: '' };
// Recibo digital: toggle + prefijo + consecutivo global único + auto-descarga.
// `next` null = aún no inicializado (se calcula del max(RC-XXXX) al primer uso).
// `autoDownload` = al generar un recibo, guardar el PNG como respaldo.
// `receiptsDir` = carpeta de esos respaldos (vacío = la carpeta de la app;
// en escritorio se puede cambiar con selector, ver preload.cjs).
// `msgWhatsapp` / `msgPie` = plantillas editables con {nombre} {numero} {plan}
// {valor} {codigo} {gym} {inicio} {fin}.
const DEFAULT_RECEIPTS = {
  enabled: false, prefix: 'RC', next: null, autoDownload: false, receiptsDir: '',
  msgWhatsapp: 'Hola {nombre}, tu recibo {numero} ({plan}) por {valor} fue registrado en {gym}. Código: {codigo}.',
  msgPie: 'Escanea para validar · presenta este recibo en recepción',
};

/** Lee una clave de settings mezclada con sus defaults. */
export function readSetting(key, defaults) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  const stored = row ? JSON.parse(row.value) : {};
  return { ...defaults, ...stored };
}

/** Guarda (upsert) el objeto completo de una clave. */
export function writeSetting(key, obj) {
  db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value')
    .run({ key, value: JSON.stringify(obj) });
  return obj;
}

/** Config actual del recibo digital (para otros routers). */
export function getReceiptsConfig() {
  return readSetting('receipts', DEFAULT_RECEIPTS);
}

/* ── Datos del gimnasio ─────────────────────────────────────────────────── */
router.get('/version', (req, res) => res.json({
  app: 'OVERSEER',
  // En Electron main.cjs setea OVERSEER_VERSION desde desktop/package.json
  // (hoy 1.0.5). En dev cae al default para no depender del build.
  version: process.env.OVERSEER_VERSION || '1.0.5',
}));

router.get('/gym', (req, res) => res.json(readSetting('gymInfo', DEFAULT_GYM)));

router.patch('/gym', (req, res) => {
  const { key, value } = req.body || {};
  const next = { ...readSetting('gymInfo', DEFAULT_GYM), [key]: value };
  res.json(writeSetting('gymInfo', next));
});

/* ── Conexión de red (desde otro dispositivo) ───────────────────────────── */
router.get('/network', async (req, res) => {
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  res.json({ port, host, primary: await primaryIp(), ips: lanIps() });
});

/* ── Notificaciones ─────────────────────────────────────────────────────── */
router.get('/notifications', (req, res) => res.json(readSetting('notifications', DEFAULT_NOTIFICATIONS)));

router.patch('/notifications', (req, res) => {
  const { key, on } = req.body || {};
  const next = { ...readSetting('notifications', DEFAULT_NOTIFICATIONS), [key]: on };
  res.json(writeSetting('notifications', next));
});

/* ── Respaldos ────────────────────────────────────────────────────────────
   A diferencia de antes (que solo sellaba la fecha), ahora "run" crea un
   respaldo REAL: snapshot consistente del SQLite a un archivo .db en la
   carpeta `backups/` junto a la BD (lib/backup.js). Se puede listar, descargar
   y borrar. La copia automática de las 03:00 la dispara el scheduler de
   index.js (mismo createBackup), no este router. */

/** Etiqueta humana de una fecha ISO: "12/08/2026 · 22:31". */
function labelFromIso(iso) {
  const d = new Date(iso);
  const p2 = (n) => String(n).padStart(2, '0');
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} · ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

router.get('/backup', (req, res) => res.json(readSetting('backup', DEFAULT_BACKUP)));

router.patch('/backup', (req, res) => {
  const { auto } = req.body || {};
  const next = { ...readSetting('backup', DEFAULT_BACKUP), auto };
  res.json(writeSetting('backup', next));
});

/* Crea una copia real de la BD y la registra como la última. */
router.post('/backup/run', async (req, res) => {
  const snap = await createBackup();
  const next = {
    ...readSetting('backup', DEFAULT_BACKUP),
    last: labelFromIso(snap.date),
    lastFile: snap.name,
  };
  res.json(writeSetting('backup', next));
});

/* Lista los respaldos guardados (más reciente primero). */
router.get('/backup/files', (req, res) => res.json({ files: listBackups() }));

/* Descarga un respaldo concreto (nombre validado contra path traversal). */
router.get('/backup/files/:name', (req, res) => {
  const path = backupPath(req.params.name);
  if (!path) return res.status(400).json({ error: 'Nombre de respaldo inválido' });
  res.download(path, req.params.name);
});

/* Restaura la BD actual desde un respaldo (reemplaza TODO el contenido). */
router.post('/backup/files/:name/restore', (req, res) => {
  if (!restoreBackup(req.params.name)) {
    return res.status(404).json({ error: 'Respaldo no encontrado' });
  }
  // Un sistema restaurado no debe resembrarse en el arranque (igual que import).
  markSeeded();
  res.json({ ok: true });
});

/* Borra un respaldo concreto. */
router.delete('/backup/files/:name', (req, res) => {
  if (!deleteBackup(req.params.name)) {
    return res.status(404).json({ error: 'Respaldo no encontrado' });
  }
  res.json({ ok: true });
});

/* ── Recibo digital (Fase 2) ────────────────────────────────────────────
   Toggle + prefijo + consecutivo. El consecutivo lo consume POST
   /receipts/issue en transacción; aquí solo se configura/consulta. */
router.get('/receipts', (req, res) => res.json(readSetting('receipts', DEFAULT_RECEIPTS)));

router.patch('/receipts', (req, res) => {
  const { enabled, prefix, autoDownload, receiptsDir, msgWhatsapp, msgPie } = req.body || {};
  const cur = readSetting('receipts', DEFAULT_RECEIPTS);
  const next = { ...cur };
  if (enabled != null) next.enabled = !!enabled;
  if (autoDownload != null) next.autoDownload = !!autoDownload;
  // Ruta de carpeta: string corto y válido (el escritorio la valida al usar).
  if (typeof receiptsDir === 'string' && receiptsDir.length <= 260) {
    next.receiptsDir = receiptsDir;
  }
  // Prefijo corto alfanumérico (2-6 chars); resto se ignora por seguridad.
  if (typeof prefix === 'string' && /^[A-Za-z0-9]{2,6}$/.test(prefix.trim())) {
    next.prefix = prefix.trim().toUpperCase();
  }
  // Plantillas del mensaje (WhatsApp y pie del PNG): texto libre ≤500 chars.
  if (typeof msgWhatsapp === 'string' && msgWhatsapp.length <= 500) {
    next.msgWhatsapp = msgWhatsapp;
  }
  if (typeof msgPie === 'string' && msgPie.length <= 200) {
    next.msgPie = msgPie;
  }
  res.json(writeSetting('receipts', next));
});

export default router;
