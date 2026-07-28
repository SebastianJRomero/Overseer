/*
  finance.js — Lógica de Caja / movimientos (backend).

  Espeja EXACTAMENTE el `services/movementsService.js` del front, pero leyendo
  los movimientos del usuario de SQLite en vez de localStorage. Mantiene la
  paridad total con el mock:

    1. GENERADOS de demo: PRNG determinista por (año, mes) → movimientos de
       ejemplo estables. Se calculan al vuelo (NO se guardan). Desaparecen en
       el Tramo B, cuando exista el libro mayor real.
    2. Del USUARIO: filas de la tabla `movements` (pueden ser pendientes hasta
       que se confirman con settle).

  Las constantes de ejemplo (desglose de ingresos, gastos fijos, historial)
  son las mismas semillas del prototipo — aquí viven como datos fijos hasta
  que el Tramo B las reemplace por agregados reales.
*/

import { createSeededRandom } from './lib/seededRandom.js';
import { parseDMY, pad2, MONTH_ABBR } from './lib/date.js';

/* ── Datos fijos de ejemplo (portados de data/seedFinance.js) ─────────────── */

export const INCOME_SOURCES = [
  { label: 'Ventas de inventario', value: 340000, color: 'var(--info)' },
  { label: 'Inscripciones nuevas', value: 90000, color: '#ff9d85' },
  { label: 'Clases especiales', value: 120000, color: '#c79dff' },
];

export const MEMBERSHIP_PRICES = {
  Quincena: 12000, '1 mes': 70000, '2 meses': 130000, '3 meses': 180000, Anual: 620000, Especial: 0,
};

export const PAID_THIS_MONTH = [
  { nombre: 'Valeria Gómez', tipo: '1 mes' },
  { nombre: 'Camila Torres', tipo: '1 mes' },
  { nombre: 'Luisa Fernanda', tipo: '1 mes' },
  { nombre: 'Mateo Cárdenas', tipo: 'Quincena' },
  { nombre: 'Andrés Restrepo', tipo: '3 meses' },
  { nombre: 'Sofía Ramírez', tipo: '2 meses' },
  { nombre: 'Daniel Ospina', tipo: '1 mes' },
];

export const FIXED_UPCOMING = [
  { label: 'Nómina (2ª quincena)', due: '30 Jul', value: 2800000, urgent: true },
  { label: 'Arriendo agosto', due: '01 Ago', value: 1800000, urgent: false },
  { label: 'Renovación software', due: '08 Ago', value: 120000, urgent: false },
  { label: 'Pedido de suplementos', due: '12 Ago', value: 450000, urgent: false },
];

export const HISTORY_MONTHS = [
  ['Feb', 5800000, 6100000],
  ['Mar', 6300000, 6000000],
  ['Abr', 6900000, 6250000],
  ['May', 7100000, 6400000],
  ['Jun', 7400000, 6250000],
];

/* ── Configuración del generador de demo (igual que el prototipo) ─────────── */

const CONCEPTS = {
  entrada: ['Membresía 1 mes', 'Membresía 3 meses', 'Membresía quincena', 'Venta de proteína', 'Inscripción nueva', 'Clase especial', 'Venta de accesorios'],
  salida: ['Pago a proveedor', 'Compra de inventario', 'Devolución a miembro', 'Pago de comisión'],
  gasto: ['Arriendo del local', 'Servicios públicos', 'Publicidad', 'Insumos de aseo'],
  mantenimiento: ['Reparación de caminadora', 'Mantenimiento A/C', 'Cambio de pesas', 'Revisión eléctrica'],
};
const RANGE = {
  entrada: { min: 12, max: 180 }, salida: { min: 40, max: 450 },
  gasto: { min: 120, max: 1800 }, mantenimiento: { min: 80, max: 400 },
};
const TYPE_POOL = ['entrada', 'entrada', 'entrada', 'salida', 'gasto', 'mantenimiento'];

/** ¿El movimiento suma (entrada) o resta (salida/gasto/mantenimiento)? */
export function sign(tipo) {
  return tipo === 'entrada' || tipo === 'entrada_pend' ? 1 : -1;
}

/** Genera los movimientos de demo de un mes (deterministas por y,m). */
export function genMonth(y, m) {
  const rnd = createSeededRandom(y * 12 + m);
  const count = 9 + Math.floor(rnd() * 6);
  const raw = [];
  for (let i = 0; i < count; i++) {
    const tipo = TYPE_POOL[Math.floor(rnd() * TYPE_POOL.length)];
    const range = RANGE[tipo];
    const concepto = CONCEPTS[tipo][Math.floor(rnd() * CONCEPTS[tipo].length)];
    const day = 1 + Math.floor(rnd() * 27);
    const amount = (range.min + Math.round(rnd() * (range.max - range.min))) * 1000;
    raw.push({
      id: `gen-${y}-${m}-${i}`, source: 'gen', tipo, concepto,
      monto: amount, day, fecha: `${pad2(day)}/${pad2(m + 1)}/${y}`,
      pending: false, settled: true, recurrent: false, items: {},
    });
  }
  return raw.sort((a, b) => b.day - a.day);
}

/**
 * Mapea una fila de `movements` (usuario) a la forma de dominio que espera la
 * UI. `items` ya viene parseado (objeto). Idéntico a toUserDomain del front.
 */
export function toUserDomain(mv) {
  const dt = parseDMY(mv.fecha);
  const pending = (mv.tipo === 'entrada_pend' || mv.tipo === 'salida_pend') && !mv.settled;
  const itemNames = Object.keys(mv.items || {});
  const itemsTitle = itemNames.length ? itemNames.map((n) => `${n} x ${mv.items[n]}`).join(', ') : '';
  const label = sign(mv.tipo) > 0 ? 'Entrada' : 'Salida';
  return {
    id: mv.id, source: 'user', tipo: mv.tipo,
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
