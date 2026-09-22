/*
  services/membersService.js — Datos de miembros (API real: Node + Express + SQLite).

  Contrato que consume la UI (via hooks, nunca directo desde componentes):
    listMembers()            → Promise<Member[]>
    createMember(datos)      → Promise<Member>   (asigna id en el backend)
    updateMember(id, patch)  → Promise<Member[]> (lista actualizada)
    renewMember(id, datos)   → Promise<Member[]>

  Antes: mock sobre localStorage. Ahora: fetch a /api/members. Las firmas y las
  formas de retorno son idénticas, así que la UI no se entera (ARQUITECTURA §9).

  Member: { id, nombre, cedula, telefono, inicio, fin, tipo, recibo,
            valor (número), obs }
  El ESTADO (vigente/pronto/vencido) nunca se guarda — se deriva con
  getMemberStatus a partir de `fin` (lib/memberStatus.js).
*/

import { apiGet, apiPost, apiPatch } from './api';

/** Lista completa de miembros. @returns {Promise<Array>} */
export async function listMembers() {
  return apiGet('/members');
}

/**
 * Crea un miembro nuevo (el wizard de alta entrega los datos ya validados).
 * @param {object} datos  campos del miembro SIN id
 * @returns {Promise<object>} el miembro creado, con id asignado
 */
export async function createMember(datos) {
  return apiPost('/members', datos);
}

/**
 * Aplica cambios parciales a un miembro (edición inline de la ficha).
 * @param {string} id
 * @param {object} patch  solo los campos que cambian
 * @returns {Promise<Array>} lista actualizada
 */
export async function updateMember(id, patch) {
  return apiPatch(`/members/${id}`, patch);
}

/**
 * Renovación de membresía: nuevas fechas/plan/recibo/valor en el mismo
 * registro. Endpoint propio porque es LA operación del negocio.
 * @param {string} id
 * @param {{tipo, inicio, fin, valor, recibo, obs}} datos
 * @returns {Promise<Array>} lista actualizada
 */
export async function renewMember(id, datos) {
  return apiPost(`/members/${id}/renew`, datos);
}

/**
 * Deshace la última renovación duplicada (SOLO superusuario): borra el
 * asiento extra y restaura el recibo previo si se envía.
 * @param {string} id
 * @param {string} [reciboPrevio]
 * @returns {Promise<{ok, deleted, members}>}
 */
export async function undoLastRenew(id, reciboPrevio) {
  return apiPost(`/members/${id}/undo-renew`, { reciboPrevio: reciboPrevio || '' });
}
