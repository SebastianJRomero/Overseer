/*
  services/api.js — Cliente HTTP mínimo para hablar con el backend.

  Único punto de contacto con la red: los services lo usan y ocultan el origen
  (ARQUITECTURA §9). Antes ese punto era storage.js (localStorage); ahora es la
  API real (Node + Express + SQLite). La UI y los hooks no cambian.

  La URL base sale de VITE_API_URL si se define (p. ej. en producción). En
  desarrollo apunta al backend del MISMO host que sirve la página en el puerto
  3001: "localhost" en el PC y la IP de la red en el móvil. Usar el mismo host
  evita dos problemas: el bloqueo de Private Network Access (localhost → IP
  privada) y tener que apuntar el teléfono a la IP a mano.

  Autenticación: cada petición manda `Authorization: Bearer <token>` (el token
  lo emite /auth/login y vive en la sesión guardada bajo 'auth'; setAuthToken
  lo actualiza al entrar/salir). Si la API responde 401 (token inválido o
  expirado) se borra la sesión local, se avisa con el evento
  `overseer:unauthorized` (SessionProvider vuelve al login) y se lanza el error.
*/

// En producción (Electron) la API se sirve junto al front → ruta relativa /api.
const DEV_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
const BASE = `${import.meta.env.VITE_API_URL || DEV_BASE}/api`;

import { load, remove } from './storage';

// Token de la sesión actual (inicializado desde la sesión recordada al cargar;
// authService lo actualiza con setAuthToken al loguearse / cerrar sesión).
let authToken = load('auth')?.token ?? null;

/** Define el token Bearer que mandan las peticiones (null = sin sesión). */
export function setAuthToken(token) {
  authToken = token || null;
}

/**
 * Hace una petición JSON y devuelve el cuerpo parseado.
 * @param {string} method  GET | POST | PATCH | PUT | DELETE
 * @param {string} path    ruta bajo /api (p. ej. '/members')
 * @param {*} [body]       cuerpo a serializar (solo si aplica)
 * @returns {Promise<*>}   JSON de la respuesta (o null si 204)
 * @throws si la respuesta no es 2xx
 */
async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    authToken = null;
    remove('auth');
    window.dispatchEvent(new Event('overseer:unauthorized'));
    throw new Error(`API ${method} ${path} → 401 no autorizado`);
  }
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiPut = (path, body) => request('PUT', path, body);
export const apiDelete = (path) => request('DELETE', path);
