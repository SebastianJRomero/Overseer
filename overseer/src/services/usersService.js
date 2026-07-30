/*
  services/usersService.js — Cuentas del sistema (API real: Node + Express + SQLite).

  Sección Ajustes → Cuentas y roles. La contraseña NO viaja ni se guarda
  (el modal ni la envía). ROLE_LEGEND es una constante estática de UI y se
  mantiene en el front (se re-exporta desde aquí por comodidad).

  Contrato:
    listUsers()        → Promise<User[]>
    createUser(datos)  → Promise<User[]>   (lista actualizada; asigna id)
    deleteUser(id)     → Promise<User[]>   (lista actualizada; solo Admin en la UI)
*/

import { apiGet, apiPost, apiDelete } from './api';
import { ROLE_LEGEND } from '../data/seedUsers';

export { ROLE_LEGEND };

/** @returns {Promise<Array>} cuentas del sistema */
export async function listUsers() {
  return apiGet('/users');
}

/**
 * Crea una cuenta (la contraseña no se envía).
 * @param {{nombre, email, rol}} datos
 * @returns {Promise<Array>} lista actualizada
 */
export async function createUser({ nombre, email, rol }) {
  return apiPost('/users', { nombre, email, rol });
}

/**
 * Elimina una cuenta. El gating (solo Admin) lo aplica la UI.
 * @param {string} id
 * @returns {Promise<Array>} lista actualizada
 */
export async function deleteUser(id) {
  return apiDelete(`/users/${id}`);
}
