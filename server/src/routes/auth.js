/*
  routes/auth.js — Autenticación (login contra la tabla `users`).

    POST /auth/login   { user, pass } → { ok, user }

  Auth de demo con ROL real (Tramo B · frente 3). Las cuentas NO guardan
  contraseña (decisión del proyecto: la clave nunca se persiste), así que la
  contraseña solo se exige NO vacía. La gracia es que la sesión traiga el ROL:

    - Si `user` (email o nombre) coincide con una cuenta ACTIVA → se devuelve esa
      cuenta con su rol real → habilita el gating de Admin (frente 4).
    - Si no coincide → sesión de demo con rol 'Admin', para no bloquear el
      acceso rápido de siempre (escribir cualquier usuario entra). Cambiar a
      rechazo estricto es trivial: devolver { ok: false } en ese caso.
*/

import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

const toAccount = (r) => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol });

router.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  const ident = (user || '').trim();
  if (!ident || !pass) return res.json({ ok: false }); // credenciales incompletas

  const row = db.prepare(
    `SELECT id, nombre, email, rol FROM users
     WHERE activo = 1 AND (LOWER(email) = LOWER(@ident) OR LOWER(nombre) = LOWER(@ident))
     LIMIT 1`,
  ).get({ ident });

  if (row) return res.json({ ok: true, user: toAccount(row) });
  // Fallback de demo: usuario no registrado → sesión Admin con el nombre escrito.
  return res.json({ ok: true, user: { id: null, nombre: ident, email: '', rol: 'Admin' } });
});

export default router;
