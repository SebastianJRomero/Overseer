/*
  services/membersService.js — Datos de miembros (mock hoy → API mañana).

  Contrato que consume la UI (via hooks, nunca directo desde componentes):
    listMembers()            → Promise<Member[]>
    createMember(datos)      → Promise<Member>   (asigna id)
    updateMember(id, patch)  → Promise<Member[]> (lista actualizada)
    renewMember(id, datos)   → Promise<Member[]>

  Mock: la lista completa vive en storage bajo 'members'; si no existe se
  siembra con los 6 miembros del prototipo. Cuando exista API real, cada
  función se convierte en su fetch equivalente y la UI no se entera.

  Member: { id, nombre, cedula, telefono, inicio, fin, tipo, recibo,
            valor (número), obs }
  El ESTADO (vigente/pronto/vencido) nunca se guarda — se deriva con
  getMemberStatus a partir de `fin` (lib/memberStatus.js).
*/

import { load, save } from './storage';
import { buildSeedMembers } from '../data/seedMembers';
import { newId } from '../lib/id';

const KEY = 'members';

/** Lee la lista, sembrando los datos de ejemplo la primera vez. */
function readAll() {
  let members = load(KEY, null);
  if (!members) {
    members = buildSeedMembers();
    save(KEY, members);
  }
  return members;
}

/**
 * Lista completa de miembros.
 * @returns {Promise<Array>}
 */
export async function listMembers() {
  return readAll();
}

/**
 * Crea un miembro nuevo (el wizard de alta entrega los datos ya validados).
 * @param {object} datos  campos del miembro SIN id
 * @returns {Promise<object>} el miembro creado, con id asignado
 */
export async function createMember(datos) {
  const member = { obs: '', ...datos, id: newId('m') };
  const members = [member, ...readAll()]; // el más nuevo arriba, como el prototipo
  save(KEY, members);
  return member;
}

/**
 * Aplica cambios parciales a un miembro (edición inline de la ficha:
 * nombre, fechas, plan…).
 * @param {string} id
 * @param {object} patch  solo los campos que cambian
 * @returns {Promise<Array>} lista actualizada
 */
export async function updateMember(id, patch) {
  const members = readAll().map((m) => (m.id === id ? { ...m, ...patch } : m));
  save(KEY, members);
  return members;
}

/**
 * Renovación de membresía: nuevas fechas/plan/recibo/valor en el mismo
 * registro. Es un update con nombre propio porque es LA operación del
 * negocio (y mañana será su propio endpoint).
 * @param {string} id
 * @param {{tipo, inicio, fin, valor, recibo, obs}} datos
 * @returns {Promise<Array>} lista actualizada
 */
export async function renewMember(id, datos) {
  return updateMember(id, datos);
}
