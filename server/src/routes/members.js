/*
  routes/members.js — Endpoints de miembros.

  Espejan el contrato de services/membersService.js:
    GET    /members            → Member[]                (listMembers)
    POST   /members            → Member (creado, con id) (createMember)
    PATCH  /members/:id        → Member[] (lista actualizada) (updateMember)
    POST   /members/:id/renew  → Member[] (lista actualizada) (renewMember)

  El ESTADO (vigente/pronto/vencido) NO se guarda: lo deriva la UI de `fin`.
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

const COLS = 'id, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs';

/** Lee la lista completa en el orden de la UI (más nuevos arriba). */
function listAll() {
  return db.prepare(`SELECT ${COLS} FROM members ORDER BY ord ASC`).all();
}

router.get('/', (req, res) => {
  res.json(listAll());
});

router.post('/', (req, res) => {
  const d = req.body || {};
  const member = {
    id: newId('m'),
    nombre: d.nombre ?? '', cedula: d.cedula ?? '', telefono: d.telefono ?? '',
    inicio: d.inicio ?? '', fin: d.fin ?? '', tipo: d.tipo ?? '',
    recibo: d.recibo ?? '', valor: d.valor ?? 0, obs: d.obs ?? '',
  };
  db.prepare(`INSERT INTO members (id, ord, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs)
    VALUES (@id, @ord, @nombre, @cedula, @telefono, @inicio, @fin, @tipo, @recibo, @valor, @obs)`)
    .run({ ...member, ord: nextOrd('members', 'top') });
  res.status(201).json(member); // createMember devuelve el miembro creado
});

/** Aplica un patch parcial y devuelve la lista actualizada (update y renew). */
function applyPatch(id, patch) {
  const allowed = ['nombre', 'cedula', 'telefono', 'inicio', 'fin', 'tipo', 'recibo', 'valor', 'obs'];
  const keys = Object.keys(patch || {}).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE members SET ${setSql} WHERE id = @id`).run({ ...patch, id });
  }
  return listAll();
}

router.patch('/:id', (req, res) => {
  res.json(applyPatch(req.params.id, req.body));
});

router.post('/:id/renew', (req, res) => {
  res.json(applyPatch(req.params.id, req.body));
});

export default router;
