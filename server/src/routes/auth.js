/*
  routes/auth.js — Autenticación (login contra la tabla `users`).

    POST /auth/login   { user, pass } → { ok, user, token }
    POST /auth/logout  (Authorization: Bearer <token>) → { ok: true }

  Auth REAL con contraseña hasheada. La clave se guarda como hash scrypt en
  users.pass_hash (ver lib/password.js) y se valida en cada login:

    - `user` (email o nombre) debe coincidir con una cuenta ACTIVA y la
      contraseña debe verificar contra su hash → se devuelve la cuenta con su
      rol, permisos y un TOKEN de sesión (Bearer).
    - Cualquier otro caso (usuario inexistente, cuenta inactiva, clave errada,
      o cuenta sin hash) → { ok: false }. Ya NO existe el fallback "cualquiera
      entra como Admin"; el único acceso sin cuenta es el superusuario maestro.

  Tokens (sessions):
    El login emite un token aleatorio guardado en la tabla `sessions` con
    vencimiento (30 días). El middleware `requireAuth` (exportado aquí y
    aplicado a las rutas en index.js) exige `Authorization: Bearer <token>`
    en TODA la API salvo login y health. Así, con el server bindeado a la red,
    nadie en la LAN puede leer o escribir sin una sesión válida. El logout
    borra la sesión → el token deja de servir (y también al resetear datos).

  Superusuario global (Tramo C · frente 5): una credencial MAESTRA que NO vive
  en la BD. Sobrevive a "eliminar cuentas" y al reset total → es el acceso de
  recuperación garantizado que desbloquea el menú de mantenimiento (flag
  `super: true`). Se configura por variable de entorno (MASTER_USER/MASTER_KEY);
  el default es SOLO para desarrollo local. Es un patrón de emergencia: si esto
  saliera a internet/multi-tenant, se quita o se reemplaza por recuperación real.
*/

import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db } from '../db.js';
import { verifyPassword } from '../lib/password.js';

const router = Router();

// Credencial maestra (configurable; default solo-dev). A diferencia del resto
// de cuentas, la del superusuario SÍ se valida (usuario + clave exactos).
const MASTER_USER = process.env.MASTER_USER || 'overseer';
const MASTER_KEY = process.env.MASTER_KEY || 'maestro-overseer';

// Duración de las sesiones emitidas por /auth/login.
const TOKEN_DAYS = 30;

// Acceso total (todas las funciones). Lo llevan el superusuario y el Admin de
// fallback, para que "cualquier usuario entra con acceso completo" siga vigente.
// Debe mantenerse en sync con ACCESS_FUNCTIONS (front rolePermissions.js) y con
// ROLE_ACCESS (seed.js). 'Editar miembros' es aparte de 'Miembros' (ver).
const ALL_ACCESS = ['Miembros', 'Editar miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas'];

// La sesión ahora incluye `permisos` (funciones accesibles) para que el front
// filtre la navegación (enforcement, Tramo C). Se parsea el JSON de la cuenta.
const toAccount = (r) => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol, permisos: JSON.parse(r.permisos || '[]') });

/** Crea una sesión (token aleatorio) y devuelve el token. */
function issueSession(userId) {
  const token = randomBytes(24).toString('hex');
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token, user_id, creada, expira) VALUES (?, ?, ?, ?)')
    .run(token, userId, new Date(now).toISOString(), new Date(now + TOKEN_DAYS * 86400000).toISOString());
  return token;
}

/**
 * Middleware de autenticación: exige `Authorization: Bearer <token>` válido.
 * Se aplica a todos los routers bajo /api excepto auth y health (ver index.js).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ error: 'Sesión requerida' });
  const row = db.prepare('SELECT user_id, expira FROM sessions WHERE token = ?').get(token);
  if (!row) return res.status(401).json({ error: 'Sesión inválida' });
  if (row.expira < new Date().toISOString()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  req.userId = row.user_id;
  req.token = token;
  return next();
}

/** Extrae el Bearer token del request (o null). */
function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}

router.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  const ident = (user || '').trim();
  if (!ident || !pass) return res.json({ ok: false }); // credenciales incompletas

  // Limpieza oportunista: descarta sesiones ya vencidas.
  db.prepare('DELETE FROM sessions WHERE expira < ?').run(new Date().toISOString());

  // Superusuario: credencial maestra exacta → sesión Admin con flag `super`.
  if (ident.toLowerCase() === MASTER_USER.toLowerCase() && pass === MASTER_KEY) {
    const token = issueSession('__super__');
    return res.json({ ok: true, user: { id: '__super__', nombre: 'Superusuario', email: MASTER_USER, rol: 'Admin', super: true, permisos: ALL_ACCESS }, token });
  }

  const row = db.prepare(
    `SELECT id, nombre, email, rol, permisos, pass_hash FROM users
     WHERE activo = 1 AND (LOWER(email) = LOWER(@ident) OR LOWER(nombre) = LOWER(@ident))
     LIMIT 1`,
  ).get({ ident });

  // Cuenta válida SOLO si existe, está activa y la contraseña verifica.
  if (row && verifyPassword(pass, row.pass_hash)) {
    const token = issueSession(row.id);
    return res.json({ ok: true, user: toAccount(row), token });
  }
  // Sin fallback: usuario/clave incorrectos → acceso denegado.
  return res.json({ ok: false });
});

// Cierra la sesión del token recibido (el que llame queda fuera).
router.post('/logout', (req, res) => {
  const token = bearerToken(req);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  return res.json({ ok: true });
});

export default router;
