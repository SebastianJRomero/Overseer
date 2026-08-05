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
*/

// En producción (Electron) la API se sirve junto al front → ruta relativa /api.
const DEV_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
const BASE = `${import.meta.env.VITE_API_URL || DEV_BASE}/api`;

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
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiPut = (path, body) => request('PUT', path, body);
export const apiDelete = (path) => request('DELETE', path);
