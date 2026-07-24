/*
  services/trainersService.js — Entrenadores (mock hoy → API mañana).

  Contrato:
    listTrainers()           → Promise<Trainer[]>
    createTrainer(datos)     → Promise<Trainer[]>   (asigna id; nace disponible)
    updateTrainer(id, patch) → Promise<Trainer[]>
    deleteTrainer(id)        → Promise<Trainer[]>
*/

import { load, save } from './storage';
import { newId } from '../lib/id';
import { SEED_TRAINERS } from '../data/seedTrainers';

const KEY = 'trainers';

function readAll() {
  let trainers = load(KEY, null);
  if (!trainers) {
    trainers = SEED_TRAINERS;
    save(KEY, trainers);
  }
  return trainers;
}

/** @returns {Promise<Array>} entrenadores */
export async function listTrainers() {
  return readAll();
}

/** Crea un entrenador (nace disponible). @returns {Promise<Array>} */
export async function createTrainer({ nombre, esp, clientes, clases }) {
  const record = {
    id: newId('tr'), nombre, esp,
    clientes: Number(clientes) || 0, clases: Number(clases) || 0, activo: true,
  };
  const next = [...readAll(), record];
  save(KEY, next);
  return next;
}

/** Actualiza un entrenador por id. @returns {Promise<Array>} */
export async function updateTrainer(id, patch) {
  const clean = {
    ...patch,
    ...(patch.clientes != null ? { clientes: Number(patch.clientes) || 0 } : {}),
    ...(patch.clases != null ? { clases: Number(patch.clases) || 0 } : {}),
  };
  const next = readAll().map((t) => (t.id === id ? { ...t, ...clean } : t));
  save(KEY, next);
  return next;
}

/** Elimina un entrenador por id. @returns {Promise<Array>} */
export async function deleteTrainer(id) {
  const next = readAll().filter((t) => t.id !== id);
  save(KEY, next);
  return next;
}
