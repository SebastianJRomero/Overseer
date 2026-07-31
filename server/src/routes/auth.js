/*
  routes/auth.js — Autenticación (login contra la tabla `users`).

    POST /auth/login   { user, pass } → { ok, user }

  Auth REAL con contraseña hasheada. La clave se guarda como hash scrypt en
  users.pass_hash (ver lib/password.js) y se valida en cada login:

    - `user` (email o nombre) debe coincidir con una cuenta ACTIVA y la
      contraseña debe verificar contra su hash → se devuelve la cuenta con su
      rol y permisos reales.
    - Cualquier otro caso (usuario inexistente, cuenta inactiva, clave errada,
      o cuenta sin hash) → { ok: false }. Ya NO existe el fallback "cualquiera
      entra como Admin"; el único acceso sin cuenta es el superusuario maestro.

  Superusuario global (Tramo C · frente 5): una credencial MAESTRA que NO vive
  en la BD. Sobrevive a "eliminar cuentas" y al reset total → es el acceso de
  recuperación garantizado que desbloquea el menú de mantenimiento (flag
  `super: true`). Se configura por variable de entorno (MASTER_USER/MASTER_KEY);
  el default es SOLO para desarrollo local. Es un patrón de emergencia: si esto
  saliera a internet/multi-tenant, se quita o se reemplaza por recuperación real.
*/

import { Router } from 'express';
import { db } from '../db.js';
import { verifyPassword } from '../lib/password.js';

const router = Router();

// Credencial maestra (configurable; default solo-dev). A diferencia del resto
// de cuentas, la del superusuario SÍ se valida (usuario + clave exactos).
const MASTER_USER = process.env.MASTER_USER || 'overseer';
const MASTER_KEY = process.env.MASTER_KEY || 'maestro-overseer';

// Acceso total (todas las funciones). Lo llevan el superusuario y el Admin de
// fallback, para que "cualquier usuario entra con acceso completo" siga vigente.
// Debe mantenerse en sync con ACCESS_FUNCTIONS (front rolePermissions.js) y con
// ROLE_ACCESS (seed.js). 'Editar miembros' es aparte de 'Miembros' (ver).
const ALL_ACCESS = ['Miembros', 'Editar miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas'];

// La sesión ahora incluye `permisos` (funciones accesibles) para que el front
// filtre la navegación (enforcement, Tramo C). Se parsea el JSON de la cuenta.
const toAccount = (r) => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol, permisos: JSON.parse(r.permisos || '[]') });

router.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  const ident = (user || '').trim();
  if (!ident || !pass) return res.json({ ok: false }); // credenciales incompletas

  // Superusuario: credencial maestra exacta → sesión Admin con flag `super`.
  if (ident.toLowerCase() === MASTER_USER.toLowerCase() && pass === MASTER_KEY) {
    return res.json({ ok: true, user: { id: '__super__', nombre: 'Superusuario', email: MASTER_USER, rol: 'Admin', super: true, permisos: ALL_ACCESS } });
  }

  const row = db.prepare(
    `SELECT id, nombre, email, rol, permisos, pass_hash FROM users
     WHERE activo = 1 AND (LOWER(email) = LOWER(@ident) OR LOWER(nombre) = LOWER(@ident))
     LIMIT 1`,
  ).get({ ident });

  // Cuenta válida SOLO si existe, está activa y la contraseña verifica.
  if (row && verifyPassword(pass, row.pass_hash)) return res.json({ ok: true, user: toAccount(row) });
  // Sin fallback: usuario/clave incorrectos → acceso denegado.
  return res.json({ ok: false });
});

export default router;
