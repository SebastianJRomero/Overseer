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

const router = Router();

const COLS = 'id, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs';

/** Lee la lista completa en el orden de la UI (más nuevos arriba). */
function listAll() {
  return db.prepare(`SELECT ${COLS} FROM members ORDER BY ord ASC`).all();
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
function addMembershipEntry({ nombre, tipo, valor }) {
  if (!valor || valor <= 0) return;
  db.prepare(`INSERT INTO movements (id, ord, tipo, monto, motivo, fecha, recurrent, settled, items, categoria)
    VALUES (@id, @ord, 'entrada', @monto, @motivo, @fecha, 0, 1, '{}', 'membresia')`)
    .run({
      id: newId('mv'), ord: nextOrd('movements', 'top'),
      monto: valor, motivo: `Membresía ${tipo || ''} · ${nombre || ''}`.trim(), fecha: todayDMY(),
    });
}

router.get('/', (req, res) => {
  res.json(listAll());
});

router.post('/', (req, res) => {
  const d = req.body || {};
  const member = {
    id: newId('m'),
    nombre: toTitleCase(d.nombre ?? ''), cedula: d.cedula ?? '', telefono: d.telefono ?? '',
    inicio: d.inicio ?? '', fin: d.fin ?? '', tipo: d.tipo ?? '',
    recibo: d.recibo ?? '', valor: d.valor ?? 0, obs: d.obs ?? '',
  };
  db.prepare(`INSERT INTO members (id, ord, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs)
    VALUES (@id, @ord, @nombre, @cedula, @telefono, @inicio, @fin, @tipo, @recibo, @valor, @obs)`)
    .run({ ...member, ord: nextOrd('members', 'top') });
  addMembershipEntry(member); // el pago del alta entra al libro mayor
  res.status(201).json(member); // createMember devuelve el miembro creado
});

/** Aplica un patch parcial y devuelve la lista actualizada (update y renew). */
function applyPatch(id, patch) {
  const allowed = ['nombre', 'cedula', 'telefono', 'inicio', 'fin', 'tipo', 'recibo', 'valor', 'obs'];
  const keys = Object.keys(patch || {}).filter((k) => allowed.includes(k));
  if (keys.length) {
    const values = { ...patch, id };
    if (values.nombre != null) values.nombre = toTitleCase(values.nombre);
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE members SET ${setSql} WHERE id = @id`).run(values);
  }
  return listAll();
}

router.patch('/:id', (req, res) => {
  res.json(applyPatch(req.params.id, req.body));
});

router.post('/:id/renew', (req, res) => {
  const list = applyPatch(req.params.id, req.body);
  // Renovar es un pago: leemos el miembro ya actualizado y asentamos el cobro
  // (nombre viene del registro; tipo/valor/inicio, de la renovación aplicada).
  const m = list.find((x) => x.id === req.params.id);
  if (m) addMembershipEntry(m);
  res.json(list);
});

export default router;
