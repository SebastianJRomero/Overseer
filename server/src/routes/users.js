/*
  routes/users.js — Endpoints de cuentas del sistema.

  Espejan services/usersService.js:
    GET    /users      → User[]                    (listUsers)
    POST   /users      → User[] (lista actualizada) (createUser)
    DELETE /users/:id  → User[] (lista actualizada) (deleteUser · solo Admin en la UI)

  La contraseña NUNCA llega ni se guarda (el modal ni la envía). ROLE_LEGEND
  es una constante estática de UI y se queda en el front.

  User: { id, nombre, email, rol, activity, activo(boolean), cedula, telefono, foto }
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

const toUser = (r) => ({
  id: r.id, nombre: r.nombre, email: r.email, rol: r.rol,
  activity: r.activity, activo: !!r.activo,
  cedula: r.cedula || '', telefono: r.telefono || '', foto: r.foto || '',
});

function listAll() {
  return db.prepare('SELECT * FROM users ORDER BY ord ASC').all().map(toUser);
}

router.get('/', (req, res) => res.json(listAll()));

router.post('/', (req, res) => {
  const { nombre, email, rol, cedula, telefono, foto } = req.body || {};
  const record = {
    id: newId('u'), nombre, email, rol, activity: 'Recién creado', activo: 1,
    cedula: cedula ?? '', telefono: telefono ?? '', foto: foto ?? '',
  };
  db.prepare(`INSERT INTO users (id, ord, nombre, email, rol, activity, activo, cedula, telefono, foto)
    VALUES (@id, @ord, @nombre, @email, @rol, @activity, @activo, @cedula, @telefono, @foto)`)
    .run({ ...record, ord: nextOrd('users', 'end') });
  res.status(201).json(listAll());
});

// Eliminar una cuenta. La UI solo ofrece esta acción a un Admin (y nunca sobre
// la propia cuenta); aquí el borrado es directo por id.
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

export default router;
