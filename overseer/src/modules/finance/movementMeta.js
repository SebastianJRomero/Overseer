/*
  modules/finance/movementMeta.js — Icono/color por tipo de movimiento.

  Centraliza el vocabulario visual para que la lista, el modal de KPI y el
  widget del Inicio pinten los movimientos igual. `sign` decide el signo del
  monto (+ verde para entradas, − para salidas/gastos).
*/

export const MOVEMENT_META = {
  entrada: { icon: '↗', color: 'var(--ok)', bg: 'var(--ok-bg)', label: 'Entrada', sign: 1 },
  salida: { icon: '↘', color: 'var(--danger)', bg: 'var(--danger-bg)', label: 'Salida', sign: -1 },
  gasto: { icon: '◫', color: 'var(--warn)', bg: 'var(--warn-bg)', label: 'Gasto', sign: -1 },
  mantenimiento: { icon: '◇', color: 'var(--info)', bg: 'var(--info-bg)', label: 'Mantenimiento', sign: -1 },
  entrada_pend: { icon: '◷', color: 'var(--info)', bg: 'var(--info-bg)', label: 'Entrada pendiente', sign: 1 },
  salida_pend: { icon: '◷', color: 'var(--warn)', bg: 'var(--warn-bg)', label: 'Salida pendiente', sign: -1 },
};

export function getMovementMeta(tipo) {
  return MOVEMENT_META[tipo] || MOVEMENT_META.entrada;
}
