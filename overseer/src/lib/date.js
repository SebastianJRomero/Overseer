/*
  lib/date.js — Utilidades de fecha con Date nativo (sin librerías, ver ARQUITECTURA §7).

  Toda la app maneja fechas en el formato colombiano `dd/mm/aaaa` (strings) y
  objetos Date solo para calcular. Centralizamos parse/format aquí para que
  ningún componente haga aritmética de fechas por su cuenta.
*/

/** Nombres en español — el dominio y la UI están en español. */
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
export const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MONTH_ABBR_UP = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_ABBR_UP = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
/** Cabecera de calendarios lunes-first (así se leen los calendarios en Colombia). */
export const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Rellena con cero a la izquierda: 7 → "07". */
export const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Convierte "dd/mm/aaaa" en Date, o null si el string no es una fecha válida.
 * Devolvemos null (y no una fecha inválida) para poder usarlo como guard.
 * @param {string} str
 * @returns {Date|null}
 */
export function parseDMY(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str || '');
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
}

/**
 * Formatea un Date como "dd/mm/aaaa".
 * @param {Date} date
 * @returns {string}
 */
export function formatDMY(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** ¿El string tiene forma de fecha dd/mm/aaaa? (para validar inputs) */
export function isValidDMY(str) {
  return parseDMY(str) !== null;
}

/** Fecha de hoy como "dd/mm/aaaa". */
export function todayDMY() {
  return formatDMY(new Date());
}

/** Hoy a medianoche — útil para comparar "¿ya pasó esta fecha?" sin que la hora estorbe. */
export function todayAtMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Suma días a una fecha "dd/mm/aaaa" y devuelve otra "dd/mm/aaaa".
 * Date corrige solo los desbordes (31 + 15 días pasa de mes automáticamente).
 * @param {string} dmy  fecha origen
 * @param {number} days puede ser negativo
 * @returns {string}    '' si la fecha de entrada no es válida
 */
export function addDays(dmy, days) {
  const d = parseDMY(dmy);
  if (!d) return '';
  d.setDate(d.getDate() + days);
  return formatDMY(d);
}

/**
 * Suma meses calendario a una fecha "dd/mm/aaaa" (así se cobran las
 * membresías: "1 mes" = mismo día del mes siguiente, no 30 días).
 * @param {string} dmy
 * @param {number} months
 * @returns {string} '' si la fecha de entrada no es válida
 */
export function addMonths(dmy, months) {
  const d = parseDMY(dmy);
  if (!d) return '';
  d.setMonth(d.getMonth() + months);
  return formatDMY(d);
}

/**
 * Clave "aaaa-mm-dd" para indexar eventos por día (ordena bien como string).
 * @param {Date} date
 * @returns {string}
 */
export function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Índice de columna lunes-first para el día 1 de un mes.
 * getDay() da 0=domingo; con (getDay()+6)%7 obtenemos 0=lunes … 6=domingo,
 * que es cómo el prototipo dibuja el calendario.
 * @param {number} year
 * @param {number} month 0-11
 * @returns {number} 0-6
 */
export function mondayFirstLead(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

/** Días que tiene un mes (month 0-11). */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Diferencia en días entre dos fechas (b − a), ignorando horas.
 * @param {Date} a
 * @param {Date} b
 * @returns {number}
 */
export function diffDays(a, b) {
  const MS_DAY = 24 * 60 * 60 * 1000;
  const a0 = new Date(a); a0.setHours(0, 0, 0, 0);
  const b0 = new Date(b); b0.setHours(0, 0, 0, 0);
  return Math.round((b0 - a0) / MS_DAY);
}
