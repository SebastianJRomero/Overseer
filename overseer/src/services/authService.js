/*
  services/authService.js — Autenticación (API real: Node + Express + SQLite).

  login() valida contra el backend (POST /auth/login), que devuelve la cuenta
  con su ROL. Las cuentas NO guardan contraseña (decisión del proyecto), así que
  la clave solo se exige no vacía; lo importante es que la sesión traiga el rol
  (habilita el gating de Admin). Ver server/src/routes/auth.js.

  "Recordarme" decide si la sesión sobrevive recargas: con remember se guarda la
  cuenta en storage; sin remember, vive solo en memoria (React) y se pierde al
  recargar. Mismo comportamiento que el prototipo.
*/

import { apiPost } from './api';
import { load, save, remove } from './storage';

const SESSION_KEY = 'auth';

/**
 * Intenta iniciar sesión contra el backend.
 * @param {{user: string, pass: string, remember: boolean}} credentials
 * @returns {Promise<{ok: true, user: {id, nombre, email, rol}} | {ok: false}>}
 *          ok:false = credenciales incompletas (la UI muestra el error).
 */
export async function login({ user, pass, remember }) {
  const res = await apiPost('/auth/login', { user, pass });
  if (!res || !res.ok) return { ok: false };
  if (remember) {
    save(SESSION_KEY, res.user);
  } else {
    // Sin "recordarme" no debe quedar rastro de sesiones anteriores.
    remove(SESSION_KEY);
  }
  return { ok: true, user: res.user };
}

/**
 * Recupera la sesión recordada (si la hay) al arrancar la app.
 * @returns {Promise<{id, nombre, email, rol} | null>}
 */
export async function getSession() {
  const session = load(SESSION_KEY, null);
  return session && session.nombre ? session : null;
}

/**
 * Cierra la sesión y olvida a la cuenta recordada.
 * @returns {Promise<void>}
 */
export async function logout() {
  remove(SESSION_KEY);
}
