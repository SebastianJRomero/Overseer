/*
  routes/members.js — Endpoints de miembros.

  Espejan el contrato de services/membersService.js:
    GET    /members            → Member[]                (listMembers)
    POST   /members            → Member (creado, con id) (createMember)
    PATCH  /members/:id        → Member[] (lista actualizada) (updateMember)
    POST   /members/:id/renew  → Member[] (lista actualizada) (renewMember)

  El ESTADO (vigente/pronto/vencido) NO se guarda: lo deriva la UI de `fin`.

  Libro mayor (Tramo B): dar de alta y RENOVAR son eventos de pago, así que
  además de escribir el miembro insertamos un asiento en `movements`
  (entrada · categoría 'membresia'). Editar datos con PATCH no es un pago y NO
  crea asiento. Es un acoplamiento del backend a `movements` a propósito: el
  front (membersService) no cambia y el pago por fin llega a Finanzas.
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';
import { todayDMY } from '../lib/date.js';
import { toTitleCase } from '../lib/text.js';
import { readSetting, writeSetting, getReceiptsConfig } from './settings.js';

const router = Router();

const COLS = 'id, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs, foto, medio_pago';

/** Normaliza el medio de pago: solo 'efectivo' | 'nequi', resto → 'efectivo'. */
function normMedio(v) {
  return v === 'nequi' ? 'nequi' : 'efectivo';
}

/** Lee la lista completa en el orden de la UI (más nuevos arriba). */
function listAll() {
  return db.prepare(`SELECT ${COLS} FROM members ORDER BY ord ASC`).all();
}

/* ── Consecutivo de recibo digital (Fase 2) ───────────────────────────
   Si el recibo digital está ACTIVO, el número manual se ignora y se asigna
   el siguiente de la serie global (transacción para no duplicar con dos
   recepciones simultáneas). Si está apagado, se respeta el manual. */
function nextReceiptNumber() {
  const cfg = getReceiptsConfig();
  if (!cfg.enabled) return null;
  const run = db.transaction(() => {
    const cur = readSetting('receipts', { enabled: false, prefix: 'RC', next: null, autoDownload: false, receiptsDir: '', msgWhatsapp: '', msgPie: '' });
    let base = cur.next;
    if (base == null) {
      let max = 0;
      for (const r of db.prepare('SELECT recibo FROM members').all()) {
        const m = String(r.recibo || '').trim().match(new RegExp(`^${cur.prefix}-(\\d{1,6})$`, 'i'));
        if (m) max = Math.max(max, Number(m[1]));
      }
      base = max + 1;
    }
    const numero = `${cur.prefix}-${String(base).padStart(4, '0')}`;
    writeSetting('receipts', { ...cur, next: base + 1 });
    return numero;
  });
  return run();
}

/**
 * Registra el pago de una membresía como asiento del libro mayor.
 * Se omite si no hay monto (plan "Especial" o valor 0): no hubo cobro.
 *
 * La `fecha` del asiento es la del PAGO (hoy), NO el inicio de la cobertura: es
 * caja recibida hoy. Antes usaba `inicio`, y en una renovación anticipada ese
 * inicio cae en un mes futuro → el ingreso no aparecía en "hoy" ni en el mes
 * actual de Finanzas. Con la fecha de hoy, alta y renovación entran al libro y
 * se ven en los movimientos del día y del mes.
 * @param {{nombre, tipo, valor}} m  datos del miembro (alta o renovación)
 */
function addMembershipEntry({ id, nombre, tipo, valor, medio_pago }) {
  if (!valor || valor <= 0) return;
  const d = new Date();
  const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  db.prepare(`INSERT INTO movements (id, ord, tipo, monto, motivo, fecha, hora, recurrent, settled, items, categoria, medio_pago)
    VALUES (@id, @ord, 'entrada', @monto, @motivo, @fecha, @hora, 0, 1, @items, 'membresia', @medio_pago)`)
    .run({
      id: newId('mv'), ord: nextOrd('movements', 'top'),
      monto: valor, motivo: `Membresía ${tipo || ''} · ${nombre || ''}`.trim(), fecha: todayDMY(), hora,
      items: JSON.stringify({ memberId: id || '' }),
      medio_pago: normMedio(medio_pago),
    });
}

router.get('/', (req, res) => {
  res.json(listAll());
});

router.post('/', (req, res) => {
  const d = req.body || {};
  // Recibo digital activo → número automático (se ignora el manual).
  const auto = nextReceiptNumber();
  const member = {
    id: newId('m'),
    nombre: toTitleCase(d.nombre ?? ''), cedula: d.cedula ?? '', telefono: d.telefono ?? '',
    inicio: d.inicio ?? '', fin: d.fin ?? '', tipo: d.tipo ?? '',
    recibo: auto ?? d.recibo ?? '', valor: d.valor ?? 0, obs: d.obs ?? '',
    medio_pago: normMedio(d.medio_pago),
  };
  db.prepare(`INSERT INTO members (id, ord, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs, medio_pago)
    VALUES (@id, @ord, @nombre, @cedula, @telefono, @inicio, @fin, @tipo, @recibo, @valor, @obs, @medio_pago)`)
    .run({ ...member, ord: nextOrd('members', 'top') });
  addMembershipEntry(member); // el pago del alta entra al libro mayor
  res.status(201).json(member); // createMember devuelve el miembro creado
});

/** Aplica un patch parcial y devuelve la lista actualizada (update y renew). */
function applyPatch(id, patch) {
  const allowed = ['nombre', 'cedula', 'telefono', 'inicio', 'fin', 'tipo', 'recibo', 'valor', 'obs', 'foto', 'medio_pago'];
  const keys = Object.keys(patch || {}).filter((k) => allowed.includes(k));
  if (keys.length) {
    const values = { ...patch, id };
    if (values.nombre != null) values.nombre = toTitleCase(values.nombre);
    if (values.medio_pago != null) values.medio_pago = normMedio(values.medio_pago);
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE members SET ${setSql} WHERE id = @id`).run(values);
  }
  return listAll();
}

router.patch('/:id', (req, res) => {
  res.json(applyPatch(req.params.id, req.body));
});

router.post('/:id/renew', (req, res) => {
  // Recibo digital activo → número automático (se ignora el manual).
  const body = { ...(req.body || {}) };
  const auto = nextReceiptNumber();
  if (auto) body.recibo = auto;
  const list = applyPatch(req.params.id, body);
  // Renovar es un pago: leemos el miembro ya actualizado y asentamos el cobro
  // (nombre viene del registro; tipo/valor/inicio, de la renovación aplicada).
  const m = list.find((x) => x.id === req.params.id);
  if (m) addMembershipEntry(m);
  res.json(list);
});

/**
 * Deshace la última renovación duplicada (SOLO superusuario): borra el
 * asiento de membresía más reciente del miembro y restaura el recibo previo
 * que envía el front (el admin lo copia del PNG/carpeta antes de confirmar).
 * Sin recibo previo, solo borra el movimiento extra.
 */
router.post('/:id/undo-renew', (req, res) => {
  if (req.userId !== '__super__') return res.status(403).json({ error: 'Solo superusuario' });
  const id = req.params.id;
  const { reciboPrevio } = req.body || {};
  const member = db.prepare('SELECT id, nombre FROM members WHERE id = ?').get(id);
  if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
  // Asiento más reciente: primero por memberId en items, si no por motivo.
  let mv = null;
  try {
    const rows = db.prepare(`SELECT id, motivo, items FROM movements WHERE categoria = 'membresia' ORDER BY ord ASC`).all();
    const byMember = rows.filter((r) => {
      try { return JSON.parse(r.items || '{}').memberId === id; } catch { return false; }
    });
    if (byMember.length) mv = byMember[byMember.length - 1];
    else {
      const byName = rows.filter((r) => String(r.motivo || '').includes(member.nombre));
      if (byName.length) mv = byName[byName.length - 1];
    }
  } catch { /* sin asiento para borrar */ }
  const run = db.transaction(() => {
    if (mv) db.prepare('DELETE FROM movements WHERE id = ?').run(mv.id);
    if (reciboPrevio && String(reciboPrevio).trim()) {
      db.prepare('UPDATE members SET recibo = @recibo WHERE id = @id')
        .run({ recibo: String(reciboPrevio).trim(), id });
    }
  });
  run();
  res.json({ ok: true, deleted: mv ? mv.id : null, members: listAll() });
});

export default router;
