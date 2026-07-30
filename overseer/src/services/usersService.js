/*
  services/usersService.js — Cuentas del sistema (API real: Node + Express + SQLite).

  Sección Ajustes → Cuentas y roles. La contraseña NO viaja ni se guarda
  (el modal ni la envía). ROLE_LEGEND es una constante estática de UI y se
  mantiene en el front (se re-exporta desde aquí por comodidad).

  Contrato:
    listUsers()          → Promise<User[]>
    createUser(datos)    → Promise<User[]>   (lista actualizada; asigna id)
    updateUser(id, patch)→ Promise<User[]>   (lista actualizada; edición desde el modal)
    deleteUser(id)       → Promise<User[]>   (lista actualizada; solo Admin en la UI)
*/

import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { ROLE_LEGEND } from '../data/seedUsers';

export { ROLE_LEGEND };

/** @returns {Promise<Array>} cuentas del sistema */
export async function listUsers() {
  return apiGet('/users');
}

/**
 * Crea una cuenta (la contraseña no se envía). `email` guarda el usuario o
 * correo (el login matchea por ambos). Cédula, teléfono y foto son opcionales.
 * @param {{nombre, email, rol, cedula?, telefono?, foto?, permisos?}} datos
 * @returns {Promise<Array>} lista actualizada
 */
export async function createUser({ nombre, email, rol, cedula, telefono, foto, permisos }) {
  return apiPost('/users', { nombre, email, rol, cedula, telefono, foto, permisos });
}

/**
 * Edita una cuenta (desde el modal). El gating (solo Admin) lo aplica la UI.
 * @param {string} id
 * @param {{nombre?, email?, rol?, cedula?, telefono?, foto?, permisos?}} patch
 * @returns {Promise<Array>} lista actualizada
 */
export async function updateUser(id, patch) {
  return apiPatch(`/users/${id}`, patch);
}

/**
 * Elimina una cuenta. El gating (solo Admin) lo aplica la UI.
 * @param {string} id
 * @returns {Promise<Array>} lista actualizada
 */
export async function deleteUser(id) {
  return apiDelete(`/users/${id}`);
}
