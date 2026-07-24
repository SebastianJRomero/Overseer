/*
  services/usersService.js — Cuentas del sistema (mock hoy → API mañana).

  Sección Ajustes → Cuentas y roles. Como todos los services: funciones async
  que ocultan el origen. La contraseña NO se persiste en el mock (en la API
  real la recibiría el backend, nunca se guarda en el cliente).

  Contrato:
    listUsers()        → Promise<User[]>
    createUser(datos)  → Promise<User[]>   (asigna id)
*/

import { load, save } from './storage';
import { newId } from '../lib/id';
import { SEED_USERS, ROLE_LEGEND } from '../data/seedUsers';

const KEY = 'users';

export { ROLE_LEGEND };

/** Lee la lista, sembrando las cuentas de ejemplo la primera vez. */
function readUsers() {
  let users = load(KEY, null);
  if (!users) {
    users = SEED_USERS;
    save(KEY, users);
  }
  return users;
}

/** @returns {Promise<Array>} cuentas del sistema */
export async function listUsers() {
  return readUsers();
}

/**
 * Crea una cuenta. La contraseña se descarta en el mock (no se guarda).
 * @param {{nombre, email, rol}} datos
 * @returns {Promise<Array>} lista actualizada
 */
export async function createUser({ nombre, email, rol }) {
  const record = { id: newId('u'), nombre, email, rol, activity: 'Recién creado', activo: true };
  const next = [...readUsers(), record];
  save(KEY, next);
  return next;
}
