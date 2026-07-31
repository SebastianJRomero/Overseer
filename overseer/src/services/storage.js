/*
  services/storage.js — Único punto de contacto con localStorage.

  Los services (mock) persisten aquí; NADIE más toca localStorage directo.
  ¿Por qué el try/catch? localStorage puede fallar (modo privado, cuota
  llena) y una app de mostrador no debe romperse por eso: si no se puede
  guardar, seguimos en memoria y ya.

  Cuando llegue la API real, este archivo simplemente deja de usarse —
  los services cambian su interior sin tocar la UI (ARQUITECTURA §9).
*/

/* Prefijo común: evita chocar con otras apps del mismo dominio
   y permite identificar/limpiar todas nuestras claves de un vistazo. */
const PREFIX = 'overseer:';

/**
 * Lee y parsea un valor guardado.
 * @param {string} key      nombre corto ('apariencia', 'members', ...)
 * @param {*} fallback      qué devolver si no existe o está corrupto
 * @returns {*}
 */
export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Serializa y guarda un valor.
 * @param {string} key
 * @param {*} value  cualquier cosa serializable a JSON
 */
export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* sin persistencia disponible: la app sigue funcionando en memoria */
  }
}

/**
 * Borra una clave (p. ej. la sesión al cerrar sesión).
 * @param {string} key
 */
export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignorar: si no se pudo borrar es que tampoco se pudo guardar */
  }
}

/* ── Helpers de mantenimiento (Tramo C · frente 5) ──────────────────────────
   Operan sobre TODO lo que vive bajo el prefijo `overseer:` (apariencia, tema,
   flags de módulos, sesión…). Los usa el menú avanzado para exportar/importar
   la config local y para el reset total. */

/** Lista las claves cortas (sin prefijo) guardadas por la app. */
function prefixedKeys() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const full = localStorage.key(i);
      if (full && full.startsWith(PREFIX)) out.push(full.slice(PREFIX.length));
    }
  } catch { /* sin acceso a localStorage: devolvemos lo que haya */ }
  return out;
}

/**
 * Vuelca toda la config local a un objeto { claveCorta: valor }.
 * @returns {Record<string, *>}
 */
export function exportAll() {
  const out = {};
  for (const k of prefixedKeys()) out[k] = load(k, null);
  return out;
}

/**
 * Escribe varias claves de una (restaurar config local desde un respaldo).
 * @param {Record<string, *>} obj
 */
export function importAll(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) save(k, v);
}

/**
 * Borra toda la config local del prefijo, salvo las claves excluidas.
 * @param {string[]} [except]  claves cortas a conservar (p. ej. ['auth'])
 */
export function clearAll(except = []) {
  for (const k of prefixedKeys()) {
    if (!except.includes(k)) remove(k);
  }
}
