/*
  services/movementsService.js — Caja / movimientos (API real: Node + Express + SQLite).

  El backend combina dos orígenes en la vista de un mes (igual que el mock):
    1. GENERADOS de demo: deterministas por (año, mes) — datos de ejemplo
       estables. Se calculan en el servidor y desaparecerán en el Tramo B,
       cuando exista el libro mayor real.
    2. Del USUARIO: los que se registran en el modal (tabla `movements`),
       pendientes hasta que se confirman (settle).

  Contrato (idéntico al mock; solo cambió el interior a fetch):
    listMonth(y, m)      → Promise<{ movements, entradas, salidas, balance }>
    listDay(y, m, d)     → Promise<movements[]>
    createMovement(mov)  → Promise<movement>   (asigna id en el backend)
    settleMovement(id)   → Promise<void>
    getHistory(y, m)     → Promise<[mes, ingresos, egresos][]>  (6 meses)
    getIncomeBreakdown() → Promise<[{ label, value, color, pct }]>
    getUpcomingExpenses()→ Promise<[{ label, due, value, urgent }]>
*/

import { apiGet, apiPost } from './api';

/**
 * Movimientos de un mes (usuario + generados) con totales confirmados.
 * @returns {Promise<{movements, entradas, salidas, balance}>}
 */
export async function listMonth(y, m) {
  return apiGet(`/movements?y=${y}&m=${m}`);
}

/** Movimientos de un día concreto (para el widget de Inicio). @returns {Promise<Array>} */
export async function listDay(y, m, d) {
  return apiGet(`/movements/day?y=${y}&m=${m}&d=${d}`);
}

/**
 * Registra un movimiento del usuario.
 * @param {{tipo, monto, motivo, fecha, recurrent, items}} mov
 * @returns {Promise<object>} el movimiento guardado (con id) — el hook lo pasa
 *          a addFromMovement (calendario) y applySale (inventario).
 */
export async function createMovement(mov) {
  return apiPost('/movements', mov);
}

/**
 * Marca un movimiento pendiente como saldado (pasa a contar en los totales).
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function settleMovement(id) {
  await apiPost(`/movements/${id}/settle`);
}

/**
 * Historial de 6 meses [mes, ingresos, egresos] para los gráficos.
 * @returns {Promise<Array>}
 */
export async function getHistory(y, m) {
  return apiGet(`/movements/history?y=${y}&m=${m}`);
}

/**
 * Desglose "Origen de las entradas" con su porcentaje del total.
 * @returns {Promise<Array>} [{ label, value, color, pct }]
 */
export async function getIncomeBreakdown() {
  return apiGet('/movements/income-breakdown');
}

/**
 * "Gastos próximos": salidas pendientes/recurrentes del usuario + gastos fijos.
 * @returns {Promise<Array>} [{ label, due, value, urgent }]
 */
export async function getUpcomingExpenses() {
  return apiGet('/movements/upcoming-expenses');
}
