/*
  routes/movements.js — Endpoints de Caja / movimientos (LIBRO MAYOR ÚNICO).

  Tramo B: la tabla `movements` es la única fuente de verdad de la caja. Todos
  los asientos (pagos de membresía, ventas, gastos, mantenimiento, históricos
  sembrados) son filas reales — ya NO se combinan con un generador demo al
  vuelo. Los totales, el desglose de ingresos y el historial se AGREGAN de esas
  filas, así Finanzas es internamente consistente. Los PENDIENTES no cuentan a
  los totales hasta confirmarse (settle).

    GET   /movements?y=&m=            → { movements, entradas, salidas, balance } (listMonth)
    GET   /movements/day?y=&m=&d=     → movements[]                    (listDay)
    POST  /movements                  → registro guardado (con id)     (createMovement)
    POST  /movements/:id/settle       → { ok: true }                   (settleMovement)
    GET   /movements/history?y=&m=    → [[mes, ingresos, egresos], …]  (getHistory · 6 meses)
    GET   /movements/income-breakdown → [{ label, value, color, pct }] (getIncomeBreakdown)
    GET   /movements/upcoming-expenses→ [{ label, due, value, urgent }](getUpcomingExpenses)
    GET   /movements/summary          → { membershipTotal, membershipCount, otherTotal, total } (getMonthSummary)
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';
import { parseDMY, MONTH_ABBR } from '../lib/date.js';
import {
  toUserDomain, sign, dueLabel, CATEGORY_META, CATEGORY_ORDER,
} from '../finance.js';

const router = Router();

/** Etiqueta de mes con inicial mayúscula: 6 → "Jul". */
const monthLabel = (m) => MONTH_ABBR[m].replace(/^\w/, (c) => c.toUpperCase());

/** Lee TODOS los asientos del libro (crudos), más nuevos primero (ORDER BY ord). */
function readAll() {
  return db.prepare('SELECT id, tipo, monto, motivo, fecha, hora, recurrent, settled, items, categoria, medio_pago FROM movements ORDER BY ord ASC').all()
    .map((r) => ({
      id: r.id, tipo: r.tipo, monto: r.monto, motivo: r.motivo, fecha: r.fecha, hora: r.hora || '',
      recurrent: !!r.recurrent, settled: !!r.settled, items: JSON.parse(r.items || '{}'),
      categoria: r.categoria || 'otro',
      medio_pago: r.medio_pago === 'nequi' ? 'nequi' : 'efectivo',
    }));
}

/** Hora actual HH:MM 24h (para el nuevo asiento). */
function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** ¿La fila (cruda) cae en el mes (y,m)? */
function inMonth(row, y, m) {
  const dt = parseDMY(row.fecha);
  return dt && dt.getFullYear() === y && dt.getMonth() === m;
}

/** listMonth: asientos del mes con totales confirmados (pendientes no cuentan). */
function listMonth(y, m) {
  const movements = readAll()
    .filter((r) => inMonth(r, y, m))
    .map(toUserDomain)
    .sort((a, b) => b.day - a.day);
  const confirmed = (mv) => !mv.pending;
  const entradas = movements.filter((mv) => confirmed(mv) && sign(mv.tipo) > 0).reduce((s, mv) => s + mv.monto, 0);
  const salidas = movements.filter((mv) => confirmed(mv) && sign(mv.tipo) < 0).reduce((s, mv) => s + mv.monto, 0);
  return { movements, entradas, salidas, balance: entradas - salidas };
}

router.get('/', (req, res) => {
  res.json(listMonth(Number(req.query.y), Number(req.query.m)));
});

router.get('/day', (req, res) => {
  const { movements } = listMonth(Number(req.query.y), Number(req.query.m));
  res.json(movements.filter((mv) => mv.day === Number(req.query.d)));
});

router.post('/', (req, res) => {
  const mov = req.body || {};
  const id = newId('mv');
  // Categoría del asiento: una venta trae artículos del inventario; el resto,
  // 'otro' (el modal de Caja no pide categoría). Los pagos de membresía y los
  // asientos sembrados fijan su propia categoría al insertarse.
  const hasItems = mov.items && Object.keys(mov.items).length > 0;
  const isIncome = sign(mov.tipo) > 0;
  const categoria = isIncome ? (hasItems ? 'venta' : 'otro') : 'otro';
  // Medio de pago: solo 'efectivo' | 'nequi' (default efectivo para no romper).
  const medio_pago = mov.medio_pago === 'nequi' ? 'nequi' : 'efectivo';
  db.prepare(`INSERT INTO movements (id, ord, tipo, monto, motivo, fecha, hora, recurrent, settled, items, categoria, medio_pago)
    VALUES (@id, @ord, @tipo, @monto, @motivo, @fecha, @hora, @recurrent, 0, @items, @categoria, @medio_pago)`)
    .run({
      id, ord: nextOrd('movements', 'top'),
      tipo: mov.tipo, monto: mov.monto, motivo: mov.motivo ?? '', fecha: mov.fecha, hora: mov.hora || nowHHMM(),
      recurrent: mov.recurrent ? 1 : 0, items: JSON.stringify(mov.items || {}), categoria, medio_pago,
    });
  // Mismo retorno que antes: el registro tal cual + id + settled:false
  // (el hook lo pasa a addFromMovement y applySale).
  res.status(201).json({ ...mov, medio_pago, id, settled: false, hora: mov.hora || '' });
});

router.post('/:id/settle', (req, res) => {
  db.prepare('UPDATE movements SET settled = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/**
 * getHistory: 6 meses [mes, ingresos, egresos] terminando en (y,m), agregados
 * del libro real (solo confirmados). Meses sin asientos → 0/0.
 */
router.get('/history', (req, res) => {
  const y = Number(req.query.y);
  const m = Number(req.query.m);
  const rows = readAll();
  const out = [];
  for (let back = 5; back >= 0; back--) {
    const d = new Date(y, m - back, 1);
    const yy = d.getFullYear();
    const mm = d.getMonth();
    let income = 0;
    let expense = 0;
    for (const r of rows) {
      if (!inMonth(r, yy, mm)) continue;
      const pending = (r.tipo === 'entrada_pend' || r.tipo === 'salida_pend') && !r.settled;
      if (pending) continue; // los pendientes no cuentan
      if (sign(r.tipo) > 0) income += r.monto; else expense += r.monto;
    }
    out.push([monthLabel(mm), income, expense]);
  }
  res.json(out);
});

/**
 * getIncomeBreakdown: desglose "Origen de las entradas" del MES CALENDARIO
 * actual (el front lo llama sin mes → semántica "este mes"), agregando las
 * entradas confirmadas por categoría. Omite categorías en 0.
 */
router.get('/income-breakdown', (req, res) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const totals = {};
  for (const r of readAll()) {
    if (!inMonth(r, y, m) || sign(r.tipo) < 0) continue;
    const pending = r.tipo === 'entrada_pend' && !r.settled;
    if (pending) continue;
    const cat = CATEGORY_META[r.categoria] ? r.categoria : 'otro';
    totals[cat] = (totals[cat] || 0) + r.monto;
  }
  const rows = CATEGORY_ORDER
    .filter((cat) => totals[cat] > 0)
    .map((cat) => ({ label: CATEGORY_META[cat].label, value: totals[cat], color: CATEGORY_META[cat].color }));
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  res.json(rows.map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) })));
});

/**
 * getMonthSummary: resumen de caja del MES CALENDARIO actual para el Inicio
 * (el KPI "Ingresos del mes" y su modal-resumen). Separa lo cobrado por
 * MEMBRESÍAS (categoria 'membresia', con su conteo) del resto de ingresos, y
 * da el total. Solo cuenta entradas CONFIRMADAS (los pendientes no suman),
 * igual criterio que el desglose de Finanzas → todo sale del libro mayor.
 */
router.get('/summary', (req, res) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let membershipTotal = 0;
  let membershipCount = 0;
  let otherTotal = 0;
  for (const r of readAll()) {
    if (!inMonth(r, y, m) || sign(r.tipo) < 0) continue;
    const pending = r.tipo === 'entrada_pend' && !r.settled;
    if (pending) continue;
    if (r.categoria === 'membresia') { membershipTotal += r.monto; membershipCount += 1; }
    else otherTotal += r.monto;
  }
  res.json({ membershipTotal, membershipCount, otherTotal, total: membershipTotal + otherTotal });
});

/**
 * getUpcomingExpenses: salidas pendientes + gastos recurrentes del libro
 * (los gastos fijos ahora son asientos recurrentes sembrados, no una lista
 * hardcodeada).
 */
router.get('/upcoming-expenses', (req, res) => {
  const rows = readAll()
    .filter((m) => (m.tipo === 'salida_pend' && !m.settled)
      || (m.recurrent && (m.tipo === 'salida' || m.tipo === 'salida_pend')))
    .map((m) => ({
      label: ((m.motivo || '').trim() || 'Salida pendiente') + (m.recurrent ? ' (mensual)' : ''),
      due: dueLabel(m.fecha), value: m.monto, urgent: true,
    }));
  res.json(rows);
});

export default router;
