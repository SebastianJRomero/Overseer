/*
  routes/movements.js — Endpoints de Caja / movimientos.

  Espejan services/movementsService.js. Combinan movimientos GENERADOS de demo
  (deterministas por mes, calculados al vuelo) con los del USUARIO (tabla
  `movements`). Los PENDIENTES no suman a los totales hasta confirmarse.

    GET   /movements?y=&m=            → { movements, entradas, salidas, balance } (listMonth)
    GET   /movements/day?y=&m=&d=     → movements[]                    (listDay)
    POST  /movements                  → registro guardado (con id)     (createMovement)
    POST  /movements/:id/settle       → { ok: true }                   (settleMovement)
    GET   /movements/history?y=&m=    → [[mes, ingresos, egresos], …]  (getHistory)
    GET   /movements/income-breakdown → [{ label, value, color, pct }] (getIncomeBreakdown)
    GET   /movements/upcoming-expenses→ [{ label, due, value, urgent }](getUpcomingExpenses)
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';
import { parseDMY, MONTH_ABBR } from '../lib/date.js';
import {
  genMonth, toUserDomain, sign, dueLabel,
  INCOME_SOURCES, MEMBERSHIP_PRICES, PAID_THIS_MONTH, FIXED_UPCOMING, HISTORY_MONTHS,
} from '../finance.js';

const router = Router();

/** Lee los movimientos del usuario (crudos), más nuevos primero (como el mock). */
function readUser() {
  return db.prepare('SELECT id, tipo, monto, motivo, fecha, recurrent, settled, items FROM movements ORDER BY ord ASC').all()
    .map((r) => ({
      id: r.id, tipo: r.tipo, monto: r.monto, motivo: r.motivo, fecha: r.fecha,
      recurrent: !!r.recurrent, settled: !!r.settled, items: JSON.parse(r.items || '{}'),
    }));
}

/** listMonth: usuario + generados, con totales confirmados (pendientes no cuentan). */
function listMonth(y, m) {
  const userMovs = readUser()
    .map(toUserDomain)
    .filter((mv) => { const dt = parseDMY(mv.fecha); return dt && dt.getFullYear() === y && dt.getMonth() === m; })
    .sort((a, b) => b.day - a.day);
  const generated = genMonth(y, m);
  const movements = [...userMovs, ...generated];
  const counts = (mv) => !mv.pending;
  const entradas = movements.filter((mv) => counts(mv) && sign(mv.tipo) > 0).reduce((s, mv) => s + mv.monto, 0);
  const salidas = movements.filter((mv) => counts(mv) && sign(mv.tipo) < 0).reduce((s, mv) => s + mv.monto, 0);
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
  db.prepare(`INSERT INTO movements (id, ord, tipo, monto, motivo, fecha, recurrent, settled, items)
    VALUES (@id, @ord, @tipo, @monto, @motivo, @fecha, @recurrent, 0, @items)`)
    .run({
      id, ord: nextOrd('movements', 'top'),
      tipo: mov.tipo, monto: mov.monto, motivo: mov.motivo ?? '', fecha: mov.fecha,
      recurrent: mov.recurrent ? 1 : 0, items: JSON.stringify(mov.items || {}),
    });
  // Mismo retorno que el mock: el registro tal cual + id + settled:false
  // (el hook lo pasa a addFromMovement y applySale).
  res.status(201).json({ ...mov, id, settled: false });
});

router.post('/:id/settle', (req, res) => {
  db.prepare('UPDATE movements SET settled = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/history', (req, res) => {
  const y = Number(req.query.y);
  const m = Number(req.query.m);
  const { salidas } = listMonth(y, m);
  const membership = PAID_THIS_MONTH.reduce((s, p) => s + (MEMBERSHIP_PRICES[p.tipo] || 0), 0);
  const otras = INCOME_SOURCES.reduce((s, o) => s + o.value, 0);
  const income = membership + otras;
  const expense = salidas || HISTORY_MONTHS[HISTORY_MONTHS.length - 1][2];
  res.json([...HISTORY_MONTHS, [MONTH_ABBR[m].replace(/^\w/, (c) => c.toUpperCase()), income, expense]]);
});

router.get('/income-breakdown', (req, res) => {
  const membership = PAID_THIS_MONTH.reduce((s, p) => s + (MEMBERSHIP_PRICES[p.tipo] || 0), 0);
  const rows = [{ label: 'Membresías', value: membership, color: 'var(--ok)' }, ...INCOME_SOURCES];
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  res.json(rows.map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) })));
});

router.get('/upcoming-expenses', (req, res) => {
  const user = readUser()
    .filter((m) => (m.tipo === 'salida_pend' && !m.settled)
      || (m.recurrent && (m.tipo === 'salida' || m.tipo === 'salida_pend')))
    .map((m) => ({
      label: ((m.motivo || '').trim() || 'Salida pendiente') + (m.recurrent ? ' (mensual)' : ''),
      due: dueLabel(m.fecha), value: m.monto, urgent: true,
    }));
  res.json([...user, ...FIXED_UPCOMING]);
});

export default router;
