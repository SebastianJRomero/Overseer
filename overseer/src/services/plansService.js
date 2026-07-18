/*
  services/plansService.js — Catálogo de planes (mock hoy → API mañana).

  Contrato:
    listPlans()        → Promise<Plan[]>  (catálogo completo, para Ajustes)
    listActivePlans()  → Promise<Plan[]>  (solo activos — lo que se ofrece
                                           al crear o renovar una membresía)

  El alta/edición de planes llega en la fase de Ajustes; por ahora el
  módulo de miembros solo necesita leer qué planes se pueden ofrecer.
*/

import { load, save } from './storage';
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
