/*
  lib/text.js — Utilidades de texto (backend).

  Réplica del helper del front (overseer/src/lib/format.js): se duplica aquí
  porque son paquetes independientes, igual que date.js/id.js/seededRandom.js.
*/

/**
 * Pone en mayúscula la primera letra de cada palabra: "david martinez" →
 * "David Martinez". Se aplica al guardar el nombre de un miembro, así queda
 * consistente en la BD sin importar cómo lo haya escrito quien lo registró.
 * @param {string} value
 * @returns {string}
 */
export function toTitleCase(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/(^|\s)([a-záéíóúñü])/g, (_, sep, ch) => sep + ch.toUpperCase());
}
