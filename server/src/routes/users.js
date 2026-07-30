/*
  routes/users.js — Endpoints de cuentas del sistema.

  Espejan services/usersService.js:
    GET    /users      → User[]                    (listUsers)
    POST   /users      → User[] (lista actualizada) (createUser)
    PATCH  /users/:id  → User[] (lista actualizada) (updateUser · edición desde el modal)
    DELETE /users/:id  → User[] (lista actualizada) (deleteUser · solo Admin en la UI)

  La contraseña NUNCA llega ni se guarda (el modal ni la envía). ROLE_LEGEND
  es una constante estática de UI y se queda en el front. `permisos` es un JSON
  con las funciones accesibles de esa cuenta (editable por el Admin).

  User: { id, nombre, email, rol, activity, activo, cedula, telefono, foto, permisos[] }
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

const toUser = (r) => ({
  id: r.id, nombre: r.nombre, email: r.email, rol: r.rol,
  activity: r.activity, activo: !!r.activo,
  cedula: r.cedula || '', telefono: r.telefono || '', foto: r.foto || '',
  permisos: JSON.parse(r.permisos || '[]'),
});

function listAll() {
  return db.prepare('SELECT * FROM users ORDER BY ord ASC').all().map(toUser);
}

/** Normaliza `permisos` a texto JSON (acepta array o ya-string). */
const permisosText = (p) => JSON.stringify(Array.isArray(p) ? p : []);

router.get('/', (req, res) => res.json(listAll()));

router.post('/', (req, res) => {
  const { nombre, email, rol, cedula, telefono, foto, permisos } = req.body || {};
  const record = {
    id: newId('u'), nombre, email, rol, activity: 'Recién creado', activo: 1,
    cedula: cedula ?? '', telefono: telefono ?? '', foto: foto ?? '', permisos: permisosText(permisos),
  };
  db.prepare(`INSERT INTO users (id, ord, nombre, email, rol, activity, activo, cedula, telefono, foto, permisos)
    VALUES (@id, @ord, @nombre, @email, @rol, @activity, @activo, @cedula, @telefono, @foto, @permisos)`)
    .run({ ...record, ord: nextOrd('users', 'end') });
  res.status(201).json(listAll());
});

// Editar una cuenta (desde el modal). Aplica solo los campos permitidos.
router.patch('/:id', (req, res) => {
  const patch = req.body || {};
  const allowed = ['nombre', 'email', 'rol', 'cedula', 'telefono', 'foto', 'permisos'];
  const sets = [];
  const params = { id: req.params.id };
  for (const k of allowed) {
    if (patch[k] === undefined) continue;
    sets.push(`${k} = @${k}`);
    params[k] = k === 'permisos' ? permisosText(patch[k]) : patch[k];
  }
  if (sets.length) {
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params);
  }
  res.json(listAll());
});

// Eliminar una cuenta. La UI solo ofrece esta acción a un Admin (y nunca sobre
// la propia cuenta); aquí el borrado es directo por id.
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

export default router;
