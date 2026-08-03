/*
  lib/format.js — Formato de cédula y teléfono para MOSTRAR.

  Regla de la casa (igual que el dinero en lib/money.js): el estado guarda
  el valor "crudo" (solo dígitos) y la UI lo formatea al pintar. Así la
  búsqueda puede comparar sin espacios ni puntos y el dato viaja limpio al
  backend el día de mañana.

    cédula   1234567890 → "1.234.567.890"  (miles con punto)
    teléfono 3175551234 → "317 555 12 34"   (grupos 3-3-2-2)

  Las funciones normalizan primero (onlyDigits), así que son idempotentes:
  da igual que reciban "1.234.567.890" o "1234567890".
*/

/** Deja solo los dígitos de un texto (para guardar y para buscar). */
export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Cédula con separador de miles: 1234567890 → "1.234.567.890".
 * Agrupa de a 3 desde la derecha con puntos (sin usar Number, que podría
 * perder precisión en documentos muy largos).
 * @param {string|number} value
 * @returns {string}
 */
export function formatCedula(value) {
  const d = onlyDigits(value);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Teléfono en grupos 3-3-2-2: 3175551234 → "317 555 12 34".
 * Tolera longitudes distintas para no romper con fijos o números cortos.
 * @param {string|number} value
 * @returns {string}
 */
export function formatPhone(value) {
  const d = onlyDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  // 9+ dígitos: 3-3-2-2 y lo que sobre se anexa al final.
  const base = `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  return d.length > 10 ? `${base} ${d.slice(10)}` : base;
}

/**
 * Pone en mayúscula la primera letra de cada palabra: "david martinez" →
 * "David Martinez". El resto de cada palabra queda en minúscula (soporta
 * acentos y ñ), así da igual cómo lo haya escrito quien lo tecleó.
 * @param {string} value
 * @returns {string}
 */
export function toTitleCase(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/(^|\s)([a-záéíóúñü])/g, (_, sep, ch) => sep + ch.toUpperCase());
}
