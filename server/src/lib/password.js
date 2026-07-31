/*
  lib/password.js — Hash y verificación de contraseñas (auth real).

  Usa scrypt del módulo `crypto` de Node (sin dependencias externas, respeta la
  regla #7). Cada clave se guarda como "salt:hash" en hex: un salt aleatorio por
  cuenta evita que dos claves iguales produzcan el mismo hash, y scrypt es lento
  a propósito (resistente a fuerza bruta). La verificación usa comparación en
  tiempo constante (timingSafeEqual) para no filtrar información por el tiempo.

  Formato almacenado en users.pass_hash:  <salt_hex>:<hash_hex>
  Una cuenta con pass_hash vacío NO puede iniciar sesión (hay que fijarle clave).
*/

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;

/**
 * Deriva el hash de una contraseña en claro.
 * @param {string} plain
 * @returns {string} "salt:hash" en hex
 */
export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(plain), salt, KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica una contraseña contra el valor guardado.
 * @param {string} plain   contraseña escrita en el login
 * @param {string} stored  valor "salt:hash" de la BD
 * @returns {boolean}
 */
export function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const ref = Buffer.from(hash, 'hex');
  const test = scryptSync(String(plain), salt, KEYLEN);
  // timingSafeEqual exige misma longitud; si difiere, no coincide.
  return ref.length === test.length && timingSafeEqual(ref, test);
}
