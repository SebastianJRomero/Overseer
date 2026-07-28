/*
  services/trainersService.js — Entrenadores (API real: Node + Express + SQLite).

  Contrato:
    listTrainers()           → Promise<Trainer[]>
    createTrainer(datos)     → Promise<Trainer[]>   (nace disponible; asigna id)
    updateTrainer(id, patch) → Promise<Trainer[]>
    deleteTrainer(id)        → Promise<Trainer[]>
*/

import { apiGet, apiPost, apiPatch, apiDelete } from './api';

/** @returns {Promise<Array>} entrenadores */
export async function listTrainers() {
  return apiGet('/trainers');
}

/** Crea un entrenador (nace disponible). @returns {Promise<Array>} */
export async function createTrainer({ nombre, esp, clientes, clases }) {
  return apiPost('/trainers', { nombre, esp, clientes, clases });
}

/** Actualiza un entrenador por id. @returns {Promise<Array>} */
export async function updateTrainer(id, patch) {
  return apiPatch(`/trainers/${id}`, patch);
}

/** Elimina un entrenador por id. @returns {Promise<Array>} */
export async function deleteTrainer(id) {
  return apiDelete(`/trainers/${id}`);
}
