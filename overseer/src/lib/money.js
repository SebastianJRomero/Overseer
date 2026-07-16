/*
  lib/money.js — Formato de dinero en pesos colombianos (COP).

  Regla de la casa: el ESTADO siempre guarda números limpios (70000) y la UI
  siempre muestra el formato colombiano con punto de miles ("$ 70.000").
  Usamos Intl.NumberFormat nativo — nada de librerías (ARQUITECTURA §7).
*/

/* Un solo formateador reutilizado: crear Intl.NumberFormat es relativamente
   costoso, así que lo instanciamos una vez a nivel de módulo. */
const formatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/**
 * Número → "$ 70.000". Es el formato de TODA cifra de dinero visible.
 * @param {number} n
 * @returns {string}
 */
export function formatMoney(n) {
  return '$ ' + formatter.format(n || 0);
}

/**
 * Número → "70.000" (sin símbolo). Lo usa MoneyInput, que dibuja el "$"
 * como prefijo fijo fuera del texto editable.
 * @param {number} n
 * @returns {string}
 */
export function formatThousands(n) {
  return formatter.format(n || 0);
}

/**
 * Texto libre → número. Tolera lo que el usuario pegue o escriba
 * ("$ 12.000", "12.000", "12000") quedándose solo con los dígitos.
 * @param {string|number} str
 * @returns {number} 0 si no hay dígitos
 */
export function parseMoney(str) {
  const digits = String(str ?? '').replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

/**
 * Formato corto para gráficos: 7400000 → "$7.4M".
 * @param {number} n
 * @returns {string}
 */
export function formatMoneyShort(n) {
  return '$' + (n / 1e6).toFixed(1) + 'M';
}
