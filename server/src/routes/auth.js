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

  Superusuario global (Tramo C · frente 5): una credencial MAESTRA que NO vive
  en la BD. Sobrevive a "eliminar cuentas" y al reset total → es el acceso de
  recuperación garantizado que desbloquea el menú de mantenimiento (flag
  `super: true`). Se configura por variable de entorno (MASTER_USER/MASTER_KEY);
  el default es SOLO para desarrollo local. Es un patrón de emergencia: si esto
  saliera a internet/multi-tenant, se quita o se reemplaza por recuperación real.
*/

import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Credencial maestra (configurable; default solo-dev). A diferencia del resto
// de cuentas, la del superusuario SÍ se valida (usuario + clave exactos).
const MASTER_USER = process.env.MASTER_USER || 'overseer';
const MASTER_KEY = process.env.MASTER_KEY || 'maestro-overseer';

const toAccount = (r) => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol });

router.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  const ident = (user || '').trim();
  if (!ident || !pass) return res.json({ ok: false }); // credenciales incompletas

  // Superusuario: credencial maestra exacta → sesión Admin con flag `super`.
  if (ident.toLowerCase() === MASTER_USER.toLowerCase() && pass === MASTER_KEY) {
    return res.json({ ok: true, user: { id: '__super__', nombre: 'Superusuario', email: MASTER_USER, rol: 'Admin', super: true } });
  }

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
