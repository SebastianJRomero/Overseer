/*
  lib/id.js — Generador de ids únicos (backend).

  Réplica exacta del `lib/id.js` del front: el backend ahora es quien asigna
  los ids, pero conservamos el MISMO formato (`prefijo-timestamp-sufijo`) para
  que las formas de retorno no cambien y la UI no note la diferencia.
*/

/**
 * @param {string} [prefix] letra o palabra que identifica la entidad ('m' = member...)
 * @returns {string} p. ej. "m-1770000000000-x4k2"
 */
export function newId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
