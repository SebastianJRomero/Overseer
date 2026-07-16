/*
  lib/holidays.js — Festivos de Colombia (fecha fija).

  El calendario pinta en lavanda los fines de semana y estos festivos.
  El prototipo solo maneja los festivos de FECHA FIJA; los festivos móviles
  (ley Emiliani: se corren al lunes) quedan documentados como mejora futura —
  cuando exista API, esta tabla debería venir de configuración.
*/

/* Claves "mm-dd" para poder consultar sin importar el año. */
const FIXED_HOLIDAYS = new Set([
  '01-01', // Año Nuevo
  '05-01', // Día del Trabajo
  '07-20', // Independencia
  '08-07', // Batalla de Boyacá
  '12-08', // Inmaculada Concepción
  '12-25', // Navidad
]);

/**
 * ¿Es festivo (de fecha fija) este día?
 * @param {number} month 0-11 (como lo entrega Date.getMonth())
 * @param {number} day   1-31
 * @returns {boolean}
 */
export function isHoliday(month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return FIXED_HOLIDAYS.has(`${mm}-${dd}`);
}
