/*
  services/classesService.js — Clases grupales (API real: Node + Express + SQLite).

  Contrato:
    listClasses()          → Promise<Class[]>
    createClass(datos)     → Promise<Class[]>   (el backend asigna id y color)
    updateClass(id, patch) → Promise<Class[]>
    deleteClass(id)        → Promise<Class[]>

  El color de cada clase (paleta categórica) lo asigna el backend al crear y lo
  conserva al editar.
*/

import { apiGet, apiPost, apiPatch, apiDelete } from './api';

/** @returns {Promise<Array>} clases grupales */
export async function listClasses() {
  return apiGet('/classes');
}

/** Crea una clase (le asigna un color de la paleta). @returns {Promise<Array>} */
export async function createClass({ nombre, coach, dias, hora, inscritos, cupo }) {
  return apiPost('/classes', { nombre, coach, dias, hora, inscritos, cupo });
}

/** Actualiza una clase por id (conserva su color). @returns {Promise<Array>} */
export async function updateClass(id, patch) {
  return apiPatch(`/classes/${id}`, patch);
}

/** Elimina una clase por id. @returns {Promise<Array>} */
export async function deleteClass(id) {
  return apiDelete(`/classes/${id}`);
}
