/*
  routes/settings.js — Config del gimnasio, notificaciones y respaldos.

  Espejan la PARTE de services/settingsService.js que es dato del negocio:
    GET   /settings/gym            → gymInfo                (getGymInfo)
    PATCH /settings/gym            → gymInfo (body {key,value})   (setGymField)
    GET   /settings/notifications  → notifications          (getNotifications)
    PATCH /settings/notifications  → notifications (body {key,on}) (setNotification)
    GET   /settings/backup         → backup                 (getBackup)
    PATCH /settings/backup         → backup (body {auto})    (setAutoBackup)
    POST  /settings/backup/run     → backup (sella la fecha) (runBackup)

  La APARIENCIA (accent/density/roundness) y los FLAGS de módulos NO están aquí:
  siguen en localStorage del front (decisión #2: el tema se persiste local; y
  ambos se leen al arrancar, sin depender del servidor). GYM_FIELDS es constante
  estática de UI y también se queda en el front.

  Guardado: tabla `settings` (clave → JSON). Solo se guardan los valores
  cambiados; al leer se mezclan con los defaults (por si falta alguno).
*/

import { Router } from 'express';
import { db } from '../db.js';

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
const DEFAULT_BACKUP = { auto: true, last: '12/07/2026 · 03:00' };

/** Lee una clave de settings mezclada con sus defaults. */
function readSetting(key, defaults) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  const stored = row ? JSON.parse(row.value) : {};
  return { ...defaults, ...stored };
}

/** Guarda (upsert) el objeto completo de una clave. */
function writeSetting(key, obj) {
  db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value')
    .run({ key, value: JSON.stringify(obj) });
  return obj;
}

/* ── Datos del gimnasio ─────────────────────────────────────────────────── */
router.get('/gym', (req, res) => res.json(readSetting('gymInfo', DEFAULT_GYM)));

router.patch('/gym', (req, res) => {
  const { key, value } = req.body || {};
  const next = { ...readSetting('gymInfo', DEFAULT_GYM), [key]: value };
  res.json(writeSetting('gymInfo', next));
});

/* ── Notificaciones ─────────────────────────────────────────────────────── */
router.get('/notifications', (req, res) => res.json(readSetting('notifications', DEFAULT_NOTIFICATIONS)));

router.patch('/notifications', (req, res) => {
  const { key, on } = req.body || {};
  const next = { ...readSetting('notifications', DEFAULT_NOTIFICATIONS), [key]: on };
  res.json(writeSetting('notifications', next));
});

/* ── Respaldos ──────────────────────────────────────────────────────────── */
router.get('/backup', (req, res) => res.json(readSetting('backup', DEFAULT_BACKUP)));

router.patch('/backup', (req, res) => {
  const { auto } = req.body || {};
  const next = { ...readSetting('backup', DEFAULT_BACKUP), auto };
  res.json(writeSetting('backup', next));
});

router.post('/backup/run', (req, res) => {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const stamp = `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} · ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const next = { ...readSetting('backup', DEFAULT_BACKUP), last: stamp };
  res.json(writeSetting('backup', next));
});

export default router;
