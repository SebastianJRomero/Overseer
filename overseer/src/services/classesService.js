/*
  services/classesService.js — Clases grupales (mock hoy → API mañana).

  Contrato:
    listClasses()          → Promise<Class[]>
    createClass(datos)     → Promise<Class[]>   (asigna id)
    updateClass(id, patch) → Promise<Class[]>
    deleteClass(id)        → Promise<Class[]>
*/

import { load, save } from './storage';
import { newId } from '../lib/id';
import { SEED_CLASSES } from '../data/seedClasses';

const KEY = 'classes';

/* Paleta categórica para las clases nuevas (rota por índice). */
const PALETTE = [
  { color: '#3f8bf5', bg: '#16233a' },
  { color: '#25c877', bg: '#1a2a22' },
  { color: '#a86ff0', bg: '#221b2e' },
  { color: '#ff9e2e', bg: '#2a2417' },
  { color: '#ff6a47', bg: '#241722' },
];

function readAll() {
  let classes = load(KEY, null);
  if (!classes) {
    classes = SEED_CLASSES;
    save(KEY, classes);
  }
  return classes;
}

/** @returns {Promise<Array>} clases grupales */
export async function listClasses() {
  return readAll();
}

/** Crea una clase (le asigna un color de la paleta). @returns {Promise<Array>} */
export async function createClass({ nombre, coach, dias, hora, inscritos, cupo }) {
  const all = readAll();
  const pal = PALETTE[all.length % PALETTE.length];
  const record = {
    id: newId('cl'), nombre, coach, dias, hora,
    inscritos: Number(inscritos) || 0, cupo: Number(cupo) || 1, ...pal,
  };
  const next = [...all, record];
  save(KEY, next);
  return next;
}

/** Actualiza una clase por id (conserva su color). @returns {Promise<Array>} */
export async function updateClass(id, patch) {
  const clean = {
    ...patch,
    ...(patch.inscritos != null ? { inscritos: Number(patch.inscritos) || 0 } : {}),
    ...(patch.cupo != null ? { cupo: Number(patch.cupo) || 1 } : {}),
  };
  const next = readAll().map((c) => (c.id === id ? { ...c, ...clean } : c));
  save(KEY, next);
  return next;
}

/** Elimina una clase por id. @returns {Promise<Array>} */
export async function deleteClass(id) {
  const next = readAll().filter((c) => c.id !== id);
  save(KEY, next);
  return next;
}
