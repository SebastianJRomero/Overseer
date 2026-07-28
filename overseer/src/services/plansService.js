/*
  services/plansService.js — Catálogo de planes (API real: Node + Express + SQLite).

  Contrato:
    listPlans()          → Promise<Plan[]>  (catálogo completo, para Ajustes)
    listActivePlans()    → Promise<Plan[]>  (solo activos — lo que se ofrece
                                             al crear o renovar una membresía)
    createPlan(datos)    → Promise<Plan[]>  (alta desde Ajustes)
    togglePlan(id)       → Promise<Plan[]>  (activar / ocultar)
    deletePlan(id)       → Promise<Plan[]>  (eliminar del catálogo)

  Plan: { id, nombre, duracionDias, precio, activo }
*/

import { apiGet, apiPost, apiDelete } from './api';

/** @returns {Promise<Array>} catálogo completo (activos e inactivos) */
export async function listPlans() {
  return apiGet('/plans');
}

/** @returns {Promise<Array>} solo los planes que se pueden vender hoy */
export async function listActivePlans() {
  return apiGet('/plans/active');
}

/** Crea un plan (nace activo). @returns {Promise<Array>} catálogo actualizado */
export async function createPlan({ nombre, duracionDias, precio }) {
  return apiPost('/plans', { nombre, duracionDias, precio });
}

/** Activa u oculta un plan. @returns {Promise<Array>} catálogo actualizado */
export async function togglePlan(id) {
  return apiPost(`/plans/${id}/toggle`);
}

/** Elimina un plan del catálogo. @returns {Promise<Array>} catálogo actualizado */
export async function deletePlan(id) {
  return apiDelete(`/plans/${id}`);
}
