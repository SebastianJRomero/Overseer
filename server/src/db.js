/*
  db.js — Conexión y esquema de SQLite (better-sqlite3).

  Un único archivo `overseer.db` (local, sin servidor de BD que administrar).
  El esquema espeja las semillas de `overseer/src/data/`: una tabla por
  entidad, más `gas_usos` (los usos de cada cilindro) y `settings` (config
  clave→JSON: datos del gimnasio, notificaciones, respaldos).

  Sobre la columna `ord`
  ----------------------
  El mock preservaba un orden concreto por entidad: algunos registros se
  ANTEPONÍAN (miembros, cilindros y movimientos nuevos salen arriba) y otros
  se ANEXABAN (productos, planes, usuarios… van al final). Reproducimos ese
  orden con una columna `ord` (real): al insertar "arriba" usamos MIN(ord)-1;
  al insertar "al final" usamos MAX(ord)+1. Siempre se lee `ORDER BY ord ASC`.
  Así la UI ve exactamente el mismo orden que con localStorage.
*/

import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// En la app de escritorio (Electron) la BD vive en %APPDATA%\OVERSEER: el main
// deja OVERSEER_DB_PATH seteado antes de cargar el bundle. En dev queda al lado
// del server (server/overseer.db) como siempre.
//
// Con OVERSEER_DB_PATH seteado NO se evalúa `import.meta.url` (queda como
// undefined): eso permite embeber este archivo con esbuild en formato CJS.
const __dirname = process.env.OVERSEER_DB_PATH
  ? undefined
  : dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.OVERSEER_DB_PATH || join(__dirname, '..', 'overseer.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');   // mejor concurrencia lectura/escritura
db.pragma('foreign_keys = ON');    // respeta la FK de gas_usos → gas_cylinders

/** Crea las tablas si no existen (idempotente). */
export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, cedula TEXT, telefono TEXT,
      inicio TEXT, fin TEXT, tipo TEXT, recibo TEXT,
      valor INTEGER, obs TEXT, foto TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      tipo TEXT, monto INTEGER, motivo TEXT, fecha TEXT,
      recurrent INTEGER DEFAULT 0, settled INTEGER DEFAULT 0,
      items TEXT DEFAULT '{}',
      categoria TEXT DEFAULT 'otro'   -- clasificación del asiento (libro mayor, Tramo B)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      dateKey TEXT, title TEXT, time TEXT, type TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, categoria TEXT,
      stock INTEGER, venta INTEGER, compra INTEGER
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, cantidad INTEGER, estado TEXT, revision TEXT, obs TEXT
    );

    CREATE TABLE IF NOT EXISTS gas_cylinders (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      destino TEXT, compra TEXT, precio INTEGER, capLb REAL,
      finalizado INTEGER DEFAULT 0, fechaFin TEXT, usosFinal INTEGER, obsFin TEXT
    );

    CREATE TABLE IF NOT EXISTS gas_usos (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      cylId TEXT, fecha TEXT, hora TEXT, servicio TEXT, obs TEXT,
      FOREIGN KEY (cylId) REFERENCES gas_cylinders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, duracionDias INTEGER, precio INTEGER, activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, email TEXT, rol TEXT, activity TEXT, activo INTEGER DEFAULT 1,
      cedula TEXT DEFAULT '', telefono TEXT DEFAULT '', foto TEXT DEFAULT '',
      permisos TEXT DEFAULT '[]',
      pass_hash TEXT DEFAULT ''   -- auth real: "salt:hash" (scrypt); vacío = no puede entrar
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, coach TEXT, dias TEXT, hora TEXT,
      inscritos INTEGER, cupo INTEGER, color TEXT, bg TEXT
    );

    CREATE TABLE IF NOT EXISTS trainers (
      id TEXT PRIMARY KEY, ord REAL NOT NULL,
      nombre TEXT, esp TEXT, clientes INTEGER, clases INTEGER, activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      creada TEXT NOT NULL,
      expira TEXT NOT NULL
    );
  `);

  // Migraciones aditivas para BDs creadas antes del Tramo B (libro mayor):
  // CREATE TABLE IF NOT EXISTS no añade columnas a una tabla ya existente, así
  // que las agregamos a mano solo si faltan (idempotente).
  ensureColumn('movements', 'categoria', "TEXT DEFAULT 'otro'");
  // Foto de miembro (data URL): no estaba en BDs creadas antes del frente 4.1.
  ensureColumn('members', 'foto', "TEXT DEFAULT ''");
  // Datos extra de las cuentas (frente 4.1): cédula, teléfono y foto (data URL).
  ensureColumn('users', 'cedula', "TEXT DEFAULT ''");
  ensureColumn('users', 'telefono', "TEXT DEFAULT ''");
  ensureColumn('users', 'foto', "TEXT DEFAULT ''");
  // Permisos por cuenta (JSON de funciones accesibles): editable por el Admin.
  ensureColumn('users', 'permisos', "TEXT DEFAULT '[]'");
  // Auth real: hash de la contraseña ("salt:hash", scrypt). BDs viejas quedan
  // con '' → esas cuentas no entran hasta fijarles clave (o resembrar).
  ensureColumn('users', 'pass_hash', "TEXT DEFAULT ''");
}

/**
 * Añade una columna a una tabla solo si aún no existe (ALTER idempotente).
 * @param {string} table
 * @param {string} col   nombre de la columna
 * @param {string} decl  tipo + default, p. ej. "TEXT DEFAULT 'otro'"
 */
function ensureColumn(table, col, decl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${decl}`);
  }
}

/**
 * Siguiente valor de `ord` para insertar en un extremo de la tabla.
 * @param {string} table
 * @param {'top'|'end'} where  'top' = anteponer (MIN-1), 'end' = anexar (MAX+1)
 * @returns {number}
 */
export function nextOrd(table, where) {
  if (where === 'top') {
    const row = db.prepare(`SELECT MIN(ord) AS m FROM ${table}`).get();
    return (row.m ?? 1) - 1;
  }
  const row = db.prepare(`SELECT MAX(ord) AS m FROM ${table}`).get();
  return (row.m ?? 0) + 1;
}

/* ══════════════════ Mantenimiento (Tramo C · frente 5) ══════════════════
   Helpers de export/import/borrado que usa el menú avanzado (/api/maintenance).
   El orden importa para las FK: `gas_cylinders` va ANTES que `gas_usos` al
   insertar (padre primero); al borrar da igual porque gas_usos cae por CASCADE.
*/

/** Todas las tablas del volcado, en orden apto para insertar (padres primero). */
export const ALL_TABLES = [
  'members', 'movements', 'events', 'products', 'equipment',
  'gas_cylinders', 'gas_usos', 'plans', 'users', 'classes', 'trainers', 'settings',
];

/**
 * Vuelca la BD completa a un objeto { tabla: filas[] } (para exportar/respaldar).
 * @returns {Record<string, object[]>}
 */
export function exportAll() {
  const out = {};
  for (const t of ALL_TABLES) out[t] = db.prepare(`SELECT * FROM ${t}`).all();
  return out;
}

/** Inserta una fila genérica: arma columnas y placeholders desde sus claves. */
function insertRow(table, row) {
  const cols = Object.keys(row);
  if (!cols.length) return;
  const names = cols.join(', ');
  const holders = cols.map((c) => `@${c}`).join(', ');
  db.prepare(`INSERT INTO ${table} (${names}) VALUES (${holders})`).run(row);
}

/**
 * Restaura desde un volcado { tabla: filas[] }. Reemplaza SOLO las tablas
 * presentes en el bundle (borra y reinserta), dentro de una transacción.
 * @param {Record<string, object[]>} bundle
 */
export function importAll(bundle) {
  const present = ALL_TABLES.filter((t) => Array.isArray(bundle?.[t]));
  const run = db.transaction(() => {
    for (const t of present) db.prepare(`DELETE FROM ${t}`).run();
    for (const t of present) for (const row of bundle[t]) insertRow(t, row);
  });
  run();
}

/** Borra TODAS las filas de TODAS las tablas (empezar de cero).
    Las sesiones NO se exportan (los tokens son secretos); el reset las borra
    igual: todos los clientes quedan fuera (deben volver a loguearse). */
export function clearAll() {
  const run = db.transaction(() => {
    for (const t of ALL_TABLES) db.prepare(`DELETE FROM ${t}`).run();
    db.prepare('DELETE FROM sessions').run();
  });
  run();
}

/**
 * Borra las filas de una lista de tablas (borrado selectivo por entidad).
 * @param {string[]} tables  subconjunto de ALL_TABLES
 */
export function clearTables(tables) {
  const valid = tables.filter((t) => ALL_TABLES.includes(t));
  const run = db.transaction(() => {
    for (const t of valid) db.prepare(`DELETE FROM ${t}`).run();
  });
  run();
}
