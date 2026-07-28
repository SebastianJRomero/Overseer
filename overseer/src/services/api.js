/*
  services/api.js — Cliente HTTP mínimo para hablar con el backend.

  Único punto de contacto con la red: los services lo usan y ocultan el origen
  (ARQUITECTURA §9). Antes ese punto era storage.js (localStorage); ahora es la
  API real (Node + Express + SQLite). La UI y los hooks no cambian.

  La URL base sale de VITE_API_URL si se define (p. ej. en producción); en
  desarrollo apunta al backend local en el puerto 3001.
*/

const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

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
