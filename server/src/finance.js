/*
  finance.js — Utilidades del libro mayor (backend).

  Tramo B: la tabla `movements` es el LIBRO MAYOR ÚNICO. Todo ingreso/egreso
  (pagos de membresía, ventas, gastos, mantenimiento) es un asiento real de esa
  tabla — ya NO hay generador demo al vuelo ni semillas fijas de ejemplo. Este
  archivo solo aporta helpers puros que usan la ruta de movimientos:

    - sign(tipo)          → +1 entrada / -1 egreso
    - toUserDomain(mv)    → fila cruda → forma de dominio que espera la UI
    - dueLabel(fecha)     → "05/07/2026" → "05 Jul" (gastos próximos)
    - CATEGORY_META       → etiqueta + color de cada categoría de ingreso
                            (para el desglose "Origen de las entradas")
*/

import { parseDMY, pad2, MONTH_ABBR } from './lib/date.js';

/* ── Categorías de ingreso (desglose "Origen de las entradas") ────────────── */
// El asiento guarda una `categoria`; aquí la traducimos a etiqueta + color.
// Los egresos no se desglosan, así que solo mapeamos las categorías de entrada.
export const CATEGORY_META = {
  membresia: { label: 'Membresías', color: 'var(--ok)' },
  venta: { label: 'Ventas de inventario', color: 'var(--info)' },
  inscripcion: { label: 'Inscripciones nuevas', color: '#ff9d85' },
  clase: { label: 'Clases especiales', color: '#c79dff' },
  otro: { label: 'Otros ingresos', color: '#9db4c0' },
};

/** Orden estable del desglose (el que espera ver el usuario). */
export const CATEGORY_ORDER = ['membresia', 'venta', 'inscripcion', 'clase', 'otro'];

/** ¿El movimiento suma (entrada) o resta (salida/gasto/mantenimiento)? */
export function sign(tipo) {
  return tipo === 'entrada' || tipo === 'entrada_pend' ? 1 : -1;
}

/**
 * Mapea una fila de `movements` a la forma de dominio que espera la UI.
 * `items` ya viene parseado (objeto). Idéntico a toUserDomain del front.
 */
export function toUserDomain(mv) {
  const dt = parseDMY(mv.fecha);
  const pending = (mv.tipo === 'entrada_pend' || mv.tipo === 'salida_pend') && !mv.settled;
  const itemNames = Object.keys(mv.items || {});
  const itemsTitle = itemNames.length ? itemNames.map((n) => `${n} x ${mv.items[n]}`).join(', ') : '';
  const label = sign(mv.tipo) > 0 ? 'Entrada' : 'Salida';
  return {
    id: mv.id, source: 'user', tipo: mv.tipo, categoria: mv.categoria || 'otro',
    concepto: itemsTitle || (mv.motivo || '').trim() || label,
    motivo: (mv.motivo || '').trim(),
    monto: mv.monto, fecha: mv.fecha, day: dt ? dt.getDate() : 0,
    pending, settled: !!mv.settled, recurrent: !!mv.recurrent, items: mv.items || {},
  };
}

/** "05/07/2026" → "05 Jul" (etiqueta de vencimiento de un gasto próximo). */
export function dueLabel(fecha) {
  const d = parseDMY(fecha);
  if (!d) return '—';
  const mon = MONTH_ABBR[d.getMonth()];
  return `${pad2(d.getDate())} ${mon.charAt(0).toUpperCase() + mon.slice(1)}`;
}
