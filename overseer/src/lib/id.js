/*
  lib/id.js — Generador de ids únicos para el mock.

  Mientras no exista API/BD (que asignaría ids reales), generamos ids con
  timestamp + sufijo aleatorio. El sufijo evita colisiones si se crean dos
  registros en el mismo milisegundo (p. ej. al sembrar datos en bucle).
*/

/**
 * @param {string} [prefix] letra o palabra que identifica la entidad ('m' = member...)
 * @returns {string} p. ej. "m-1770000000000-x4k2"
 */
export function newId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
