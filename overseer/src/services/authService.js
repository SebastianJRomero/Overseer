/*
  services/authService.js — Autenticación (API real: Node + Express + SQLite).

  login() valida contra el backend (POST /auth/login) con AUTH REAL: la cuenta
  debe existir, estar activa y la contraseña debe verificar contra su hash
  (scrypt). El backend devuelve la cuenta con su ROL, permisos y un TOKEN de
  sesión, o { ok:false } si las credenciales son incorrectas. El token lo usa
  api.js en cada petición (Authorization: Bearer). Ver server/src/routes/auth.js.

  "Recordarme" decide si la sesión sobrevive recargas: con remember se guarda la
  cuenta+token en storage; sin remember, el token vive solo en memoria (api.js)
  y la sesión se pierde al recargar. Cerrar sesión revoca el token en el server
  (POST /auth/logout) y borra lo guardado.
*/

import { apiPost } from './api';
import { setAuthToken } from './api';
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
  setAuthToken(res.token);
  if (remember) {
    save(SESSION_KEY, { ...res.user, token: res.token });
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
  // Sin token la sesión no puede autenticar la API: se descarta (obliga a
  // volver al login). Pasa con sesiones guardadas por versiones viejas.
  return session && session.nombre && session.token ? session : null;
}

/**
 * Cierra la sesión: revoca el token en el server (si responde) y olvida la
 * cuenta recordada.
 * @returns {Promise<void>}
 */
export async function logout() {
  try { await apiPost('/auth/logout'); } catch { /* sin red: se cierra igual */ }
  setAuthToken(null);
  remove(SESSION_KEY);
}
