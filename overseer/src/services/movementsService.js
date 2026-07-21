/*
  services/movementsService.js — Caja / movimientos (mock hoy → API mañana).

  Dos orígenes se mezclan en la vista de un mes:
    1. GENERADOS de demo: un PRNG determinista por (año, mes) produce
       movimientos de ejemplo estables (el mismo mes siempre se ve igual).
       Vive SOLO en el mock; desaparece con la API real.
    2. Del USUARIO: los que se registran en el modal de movimiento, guardados
       en storage. Pueden ser pendientes (entrada_pend/salida_pend) hasta que
       se confirman (settle).

  Contrato:
    listMonth(y, m)      → Promise<{ movements, entradas, salidas, balance }>
    listDay(y, m, d)     → Promise<movements[]>
    createMovement(mov)  → Promise<movement>   (asigna id)
    settleMovement(id)   → Promise<void>       (marca un pendiente como saldado)
    getHistory(y, m)     → Promise<[mes, ingresos, egresos][]>  (6 meses)

  Movimiento (dominio): { id, source:'user'|'gen', tipo, concepto, monto,
                          fecha 'dd/mm/aaaa', day, pending, settled, recurrent, items }
  tipo ∈ entrada | salida | entrada_pend | salida_pend (usuario)
        | entrada | salida | gasto | mantenimiento (generados)
*/

import { load, save } from './storage';
import { createSeededRandom } from '../lib/seededRandom';
import { parseDMY, pad2, MONTH_ABBR } from '../lib/date';
import { newId } from '../lib/id';
import { FIXED_UPCOMING, HISTORY_MONTHS, INCOME_SOURCES, MEMBERSHIP_PRICES, PAID_THIS_MONTH } from '../data/seedFinance';

const KEY = 'movements';

/* ── Configuración del generador de demo (igual que el prototipo) ── */
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
function sign(tipo) {
  return tipo === 'entrada' || tipo === 'entrada_pend' ? 1 : -1;
}

/** Genera los movimientos de demo de un mes (deterministas por y,m). */
function genMonth(y, m) {
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

/** Movimientos del usuario guardados. */
function readUser() {
  return load(KEY, []);
}

/** Mapea un movimiento de usuario del storage a la forma de dominio. */
function toUserDomain(mv) {
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

/**
 * Movimientos de un mes (usuario + generados) con totales confirmados.
 * Los PENDIENTES no suman a los totales hasta confirmarse.
 * @returns {Promise<{movements, entradas, salidas, balance}>}
 */
export async function listMonth(y, m) {
  const userMovs = readUser()
    .map(toUserDomain)
    .filter((mv) => { const dt = parseDMY(mv.fecha); return dt && dt.getFullYear() === y && dt.getMonth() === m; })
    .sort((a, b) => b.day - a.day);
  const generated = genMonth(y, m);
  const movements = [...userMovs, ...generated];

  // Totales: generados siempre cuentan; del usuario solo si no están pendientes.
  const counts = (mv) => !mv.pending; // pendiente sin saldar no cuenta
  const entradas = movements.filter((mv) => counts(mv) && sign(mv.tipo) > 0).reduce((s, mv) => s + mv.monto, 0);
  const salidas = movements.filter((mv) => counts(mv) && sign(mv.tipo) < 0).reduce((s, mv) => s + mv.monto, 0);
  return { movements, entradas, salidas, balance: entradas - salidas };
}

/**
 * Movimientos de un día concreto (para el widget de Inicio, fase 5).
 * @returns {Promise<Array>}
 */
export async function listDay(y, m, d) {
  const { movements } = await listMonth(y, m);
  return movements.filter((mv) => mv.day === d);
}

/**
 * Registra un movimiento del usuario.
 * @param {{tipo, monto, motivo, fecha, recurrent, items}} mov
 * @returns {Promise<object>} el movimiento guardado (con id)
 */
export async function createMovement(mov) {
  const record = { ...mov, id: newId('mv'), settled: false };
  save(KEY, [record, ...readUser()]);
  return record;
}

/**
 * Marca un movimiento pendiente como saldado (deja de ser pendiente y pasa
 * a contar en los totales).
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function settleMovement(id) {
  save(KEY, readUser().map((mv) => (mv.id === id ? { ...mv, settled: true } : mv)));
}

/**
 * Historial de 6 meses [mes, ingresos, egresos] para los gráficos: los 5
 * anteriores son fijos (seed) y el último es el mes indicado, con sus
 * totales reales (membresías + otras entradas vs egresos del mes).
 * @returns {Promise<Array>}
 */
export async function getHistory(y, m) {
  const { salidas } = await listMonth(y, m);
  // Ingreso "de negocio" del mes: membresías cobradas + otras fuentes.
  const membership = PAID_THIS_MONTH.reduce((s, p) => s + (MEMBERSHIP_PRICES[p.tipo] || 0), 0);
  const otras = INCOME_SOURCES.reduce((s, o) => s + o.value, 0);
  const income = membership + otras;
  const expense = salidas || HISTORY_MONTHS[HISTORY_MONTHS.length - 1][2];
  return [...HISTORY_MONTHS, [MONTH_ABBR[m].replace(/^\w/, (c) => c.toUpperCase()), income, expense]];
}

/* "05 jul" → "05 Jul" (etiqueta de vencimiento). */
function dueLabel(fecha) {
  const d = parseDMY(fecha);
  if (!d) return '—';
  const mon = MONTH_ABBR[d.getMonth()];
  return `${pad2(d.getDate())} ${mon.charAt(0).toUpperCase() + mon.slice(1)}`;
}

/**
 * Desglose "Origen de las entradas": membresías cobradas + otras fuentes,
 * con su porcentaje del total. Datos de ejemplo (seed).
 * @returns {Promise<Array>} [{ label, value, color, pct }]
 */
export async function getIncomeBreakdown() {
  const membership = PAID_THIS_MONTH.reduce((s, p) => s + (MEMBERSHIP_PRICES[p.tipo] || 0), 0);
  const rows = [{ label: 'Membresías', value: membership, color: 'var(--ok)' }, ...INCOME_SOURCES];
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return rows.map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) }));
}

/**
 * "Gastos próximos": salidas pendientes/recurrentes del usuario + los gastos
 * fijos de ejemplo.
 * @returns {Promise<Array>} [{ label, due, value, urgent }]
 */
export async function getUpcomingExpenses() {
  const user = readUser()
    .filter((m) => (m.tipo === 'salida_pend' && !m.settled)
      || (m.recurrent && (m.tipo === 'salida' || m.tipo === 'salida_pend')))
    .map((m) => ({
      label: ((m.motivo || '').trim() || 'Salida pendiente') + (m.recurrent ? ' (mensual)' : ''),
      due: dueLabel(m.fecha), value: m.monto, urgent: true,
    }));
  return [...user, ...FIXED_UPCOMING];
}
