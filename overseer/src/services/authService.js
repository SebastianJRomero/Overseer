/*
  services/authService.js — Autenticación (mock hoy → API mañana).

  MOCK a propósito: cualquier usuario y contraseña NO vacíos son válidos,
  igual que el prototipo. Cuando exista backend, login() hará un fetch a
  /auth/login y devolverá el usuario real + token — sin tocar la UI.

  "Recordarme" decide si la sesión sobrevive recargas: con remember se
  guarda en storage; sin remember, la sesión vive solo en memoria (React)
  y se pierde al recargar. Mismo comportamiento que el prototipo.
*/

import { load, save, remove } from './storage';

const SESSION_KEY = 'auth';

/**
 * Intenta iniciar sesión.
 * @param {{user: string, pass: string, remember: boolean}} credentials
 * @returns {Promise<{ok: true, user: string} | {ok: false}>}
 *          ok:false = credenciales incompletas (la UI muestra el error).
 */
export async function login({ user, pass, remember }) {
  const cleanUser = (user || '').trim();
  if (!cleanUser || !pass) {
    return { ok: false };
  }
  if (remember) {
    save(SESSION_KEY, { user: cleanUser });
  } else {
    // Sin "recordarme" no debe quedar rastro de sesiones anteriores.
    remove(SESSION_KEY);
  }
  return { ok: true, user: cleanUser };
}

/**
 * Recupera la sesión recordada (si la hay) al arrancar la app.
 * @returns {Promise<{user: string} | null>}
 */
export async function getSession() {
  const session = load(SESSION_KEY, null);
  return session && session.user ? session : null;
}

/**
 * Cierra la sesión y olvida al usuario recordado.
 * @returns {Promise<void>}
 */
export async function logout() {
  remove(SESSION_KEY);
}
