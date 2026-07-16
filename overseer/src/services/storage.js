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
