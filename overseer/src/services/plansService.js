/*
  services/plansService.js — Catálogo de planes (mock hoy → API mañana).

  Contrato:
    listPlans()          → Promise<Plan[]>  (catálogo completo, para Ajustes)
    listActivePlans()    → Promise<Plan[]>  (solo activos — lo que se ofrece
                                             al crear o renovar una membresía)
    createPlan(datos)    → Promise<Plan[]>  (alta desde Ajustes)
    togglePlan(id)       → Promise<Plan[]>  (activar / ocultar)
    deletePlan(id)       → Promise<Plan[]>  (eliminar del catálogo)

  Plan: { id, nombre, duracionDias, precio, activo }
*/

import { load, save } from './storage';
import { newId } from '../lib/id';
import { SEED_PLANS } from '../data/seedPlans';

const KEY = 'plans';

function readAll() {
  let plans = load(KEY, null);
  if (!plans) {
    plans = SEED_PLANS;
    save(KEY, plans);
  }
  return plans;
}

/** @returns {Promise<Array>} catálogo completo (activos e inactivos) */
export async function listPlans() {
  return readAll();
}

/** @returns {Promise<Array>} solo los planes que se pueden vender hoy */
export async function listActivePlans() {
  return readAll().filter((p) => p.activo);
}

/** Crea un plan (nace activo). @returns {Promise<Array>} catálogo actualizado */
export async function createPlan({ nombre, duracionDias, precio }) {
  const record = { id: newId('p'), nombre, duracionDias: Number(duracionDias) || 0, precio: Number(precio) || 0, activo: true };
  const next = [...readAll(), record];
  save(KEY, next);
  return next;
}

/** Activa u oculta un plan. @returns {Promise<Array>} catálogo actualizado */
export async function togglePlan(id) {
  const next = readAll().map((p) => (p.id === id ? { ...p, activo: !p.activo } : p));
  save(KEY, next);
  return next;
}

/** Elimina un plan del catálogo. @returns {Promise<Array>} catálogo actualizado */
export async function deletePlan(id) {
  const next = readAll().filter((p) => p.id !== id);
  save(KEY, next);
  return next;
}
