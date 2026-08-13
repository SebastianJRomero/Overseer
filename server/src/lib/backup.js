/*
  lib/backup.js — Copias de seguridad REALES de la BD (archivo .db en disco).

  Reemplaza el viejo "sello de fecha": ahora "Crear copia ahora" y la copia
  automática de las 03:00 generan un snapshot consistente del SQLite con
  `db.backup()` de better-sqlite3 (API nativa, sin librerías extra; funciona
  con WAL porque el snapshot se toma por páginas y no corrompe la BD en uso).

  El archivo queda en una carpeta `backups` AL LADO de la BD (resuelta desde
  `db.name`, que en Electron es %APPDATA%\OVERSEER\overseer.db → backups en
  %APPDATA%\OVERSEER\backups, carpeta escribible; en dev en server/backups).
  Así funciona igual en desarrollo y en la app de escritorio, sin cambios.

  Además de crear, este módulo lista, resuelve rutas seguras (para descargar/
  borrar) y PODA: conserva solo las `OVERSEER_BACKUP_KEEP` más recientes (30).
  La copia automática es best-effort: si falla, se loguea y no tumba el server.
*/

import { db, ALL_TABLES } from '../db.js';
import { dirname, join } from 'node:path';
import { mkdirSync, readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';

const PREFIX = 'overseer-backup-';     // prefijo que identifica NUESTROS respaldos
const AUTO_HOUR = 3;                   // la automática corre a partir de las 03:00
const KEEP = Math.max(1, Number(process.env.OVERSEER_BACKUP_KEEP || 30));

/** Carpeta de respaldos: `backups/` junto al archivo de la BD (se crea si falta). */
function backupDir() {
  const dir = join(dirname(db.name), 'backups');
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Nombre de archivo con fecha/hora LOCAL: overseer-backup-2026-08-12-2231.db */
function stampName() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  return `${PREFIX}${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.db`;
}

/**
 * Metadata de un respaldo (o null si el archivo ya no está).
 * @param {string} name
 * @returns {{name: string, size: number, date: string}|null}
 */
function readBackup(name) {
  const path = join(backupDir(), name);
  try {
    const st = statSync(path);
    return { name, size: st.size, date: st.mtime.toISOString() };
  } catch {
    return null;
  }
}

/**
 * Crea una copia real de la BD y poda las viejas.
 * @returns {Promise<{name: string, size: number, date: string}>}
 */
export async function createBackup() {
  const name = stampName();
  const dest = join(backupDir(), name); // backupDir() ya creó la carpeta
  await db.backup(dest);
  pruneBackups();
  return readBackup(name);
}

/** Lista los respaldos existentes, del más reciente al más viejo. */
export function listBackups() {
  return readdirSync(backupDir())
    .filter((f) => f.startsWith(PREFIX) && f.endsWith('.db'))
    .map(readBackup)
    .filter(Boolean)
    .sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0));
}

/**
 * Ruta segura de un respaldo por nombre, o null si no es un nombre nuestro.
 * Valida el formato para que ni la descarga ni el borrado salgan de la carpeta.
 * @param {string} name
 * @returns {string|null}
 */
export function backupPath(name) {
  if (!/^overseer-backup-[\d-]+\.db$/.test(name || '')) return null;
  return join(backupDir(), name);
}

/** Borra un respaldo por nombre. @returns {boolean} true si existía. */
export function deleteBackup(name) {
  const path = backupPath(name);
  if (!path || !existsSync(path)) return false;
  unlinkSync(path);
  // Limpieza de acompañantes WAL/SHM: aparecen si la copia llegó a abrirse
  // (p. ej. para verificarla o restaurarla); si no, al fin los ignoran
  // listBackups igual.
  for (const ext of ['-wal', '-shm']) {
    try { unlinkSync(path + ext); } catch { /* no existían */ }
  }
  return true;
}

/**
 * Restaura la BD ACTUAL desde un respaldo .db.
 *
 * No se puede reemplazar el archivo en caliente (el server tiene la conexión
 * abierta y con WAL), así que copiamos el contenido tabla por tabla: se
 * ATTACH el respaldo en modo lectura y, por cada tabla, se borra la actual y
 * se insertan las filas del respaldo (misma lógica que importAll). Las tablas
 * que no existan en el respaldo se dejan vacías; las columnas que no tenga el
 * respaldo quedan en su default. `sessions` NO se toca (el usuario sigue con
 * su sesión). Va en una transacción: si algo falla, nada se modifica.
 *
 * @param {string} name  nombre del respaldo
 * @returns {boolean} false si el respaldo no existe
 */
export function restoreBackup(name) {
  const path = backupPath(name);
  if (!path || !existsSync(path)) return false;
  // Ruta con / (SQLite la lee bien en Windows y evita escapes raros en ATTACH).
  const attachPath = path.replace(/\\/g, '/');

  // ATTACH fuera de la transacción: SQLite no deja hacer DETACH con una
  // transacción activa ("database bt is locked").
  db.prepare('ATTACH ? AS bt').run(attachPath);
  try {
    const run = db.transaction(() => {
      for (const t of ALL_TABLES) {
        const cols = db.prepare(`PRAGMA bt.table_info(${t})`).all().map((c) => c.name);
        if (!cols.length) continue; // el respaldo no tiene esta tabla
        db.prepare(`DELETE FROM ${t}`).run();
        db.prepare(`INSERT INTO ${t} (${cols.join(', ')}) SELECT ${cols.join(', ')} FROM bt.${t}`).run();
      }
    });
    run();
  } finally {
    db.prepare('DETACH bt').run();
    // El ATTACH abrió el respaldo en WAL → deja -wal/-shm junto a él; se quitan
    // (están vacíos: solo se leyó) para no dejar huérfanos.
    for (const ext of ['-wal', '-shm']) {
      try { unlinkSync(path + ext); } catch { /* no existían */ }
    }
  }
  return true;
}

/** Poda: conserva solo las KEEP más recientes (borra el excedente). */
function pruneBackups() {
  for (const b of listBackups().slice(KEEP)) {
    try { unlinkSync(join(backupDir(), b.name)); } catch { /* best-effort */ }
  }
}

/** ¿El auto-respaldo está activado? (default: sí, como el toggle de la UI). */
function isAutoEnabled() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('backup');
  const stored = row ? JSON.parse(row.value) : {};
  return stored.auto !== false;
}

/** ¿Ya existe una copia con la fecha de hoy? (para no duplicar la automática). */
function hasTodayBackup() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const today = `${PREFIX}${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  return listBackups().some((b) => b.name.startsWith(today));
}

/** ¿Toca correr la copia automática AHORA? (auto + pasaron las 03:00 + sin copia de hoy). */
function dueForAuto() {
  if (!isAutoEnabled()) return false;
  const now = new Date();
  if (now.getHours() * 100 + now.getMinutes() < AUTO_HOUR * 100) return false;
  return !hasTodayBackup();
}

/** Ejecuta la automática si corresponde. Nunca lanza (best-effort). */
export async function runAutoIfDue() {
  if (!dueForAuto()) return null;
  try {
    return await createBackup();
  } catch (e) {
    console.error('[backup] copia automática falló:', e);
    return null;
  }
}

let timer = null;

/**
 * Arranca el scheduler diario (se llama UNA vez en index.js). Comprueba cada
 * minuto; además corre al arrancar para recuperar copias atrasadas (si la app
 * no estaba abierta a las 03:00, la hace en cuanto se abre pasada esa hora).
 */
export function startAutoBackup() {
  if (timer) return;
  runAutoIfDue(); // catch-up al arrancar
  timer = setInterval(() => runAutoIfDue(), 60_000);
}
