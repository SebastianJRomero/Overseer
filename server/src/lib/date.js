/*
  lib/date.js — Utilidades de fecha (backend).

  Subconjunto portado del `lib/date.js` del front, con la MISMA lógica: la app
  maneja fechas en formato colombiano `dd/mm/aaaa`. El backend las necesita
  para (a) sembrar las semillas relativas a hoy igual que el mock y (b) el
  generador de movimientos demo. No se añaden librerías: solo Date nativo.
*/

export const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Rellena con cero a la izquierda: 7 → "07". */
export const pad2 = (n) => String(n).padStart(2, '0');

/** "dd/mm/aaaa" → Date, o null si no es una fecha válida (sirve de guard). */
export function parseDMY(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str || '');
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
}

/** Date → "dd/mm/aaaa". */
export function formatDMY(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Fecha de hoy como "dd/mm/aaaa". */
export function todayDMY() {
  return formatDMY(new Date());
}

/** Hoy a medianoche — para comparar "¿ya pasó esta fecha?" sin que la hora estorbe. */
export function todayAtMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Suma días a una fecha "dd/mm/aaaa" y devuelve otra "dd/mm/aaaa" ('' si es inválida). */
export function addDays(dmy, days) {
  const d = parseDMY(dmy);
  if (!d) return '';
  d.setDate(d.getDate() + days);
  return formatDMY(d);
}

/** Suma meses CALENDARIO a "dd/mm/aaaa" (así se cobran las membresías). */
export function addMonths(dmy, months) {
  const d = parseDMY(dmy);
  if (!d) return '';
  d.setMonth(d.getMonth() + months);
  return formatDMY(d);
}

/** Clave "aaaa-mm-dd" para indexar eventos por día (ordena bien como string). */
export function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
