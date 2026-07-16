/*
  services/settingsService.js — Configuración de la app (mock → API mañana).

  Como todos los services: funciones ASYNC aunque el mock sea síncrono.
  Así, cuando esto sea un fetch a la API, ni los hooks ni los componentes
  cambian — solo cambia el interior de este archivo (ARQUITECTURA §9).

  Fase 0: solo apariencia (tema) y flags de módulos.
  Fase 7 ampliará: datos del gimnasio, toggles de notificación, respaldos.
*/

import { load, save } from './storage';

/* ── Apariencia (Ajustes → Apariencia) ─────────────────────────────────── */

/** Valores por defecto = los defaults del prototipo. */
const DEFAULT_APPEARANCE = {
  accent: 'coral',        // coral | electrico | oceano | purpura
  density: 'comodo',      // compacto | comodo | espacioso
  roundness: 'redondeado', // nitido | redondeado | suave
};

/**
 * @returns {Promise<{accent: string, density: string, roundness: string}>}
 */
export async function getAppearance() {
  // Mezclamos con los defaults por si se guardó una versión vieja incompleta.
  return { ...DEFAULT_APPEARANCE, ...load('apariencia', {}) };
}

/**
 * Guarda uno o varios ejes de apariencia.
 * @param {Partial<{accent: string, density: string, roundness: string}>} patch
 * @returns {Promise<object>} la apariencia resultante
 */
export async function setAppearance(patch) {
  const next = { ...(await getAppearance()), ...patch };
  save('apariencia', next);
  return next;
}

/* ── Flags de módulos opcionales (Ajustes → Módulos) ───────────────────── */

/** Por defecto los tres opcionales están encendidos, como en el prototipo. */
const DEFAULT_FLAGS = { classes: true, trainers: true, reports: true };

/**
 * @returns {Promise<Record<string, boolean>>} id de módulo → visible
 */
export async function getModuleFlags() {
  return { ...DEFAULT_FLAGS, ...load('moduleFlags', {}) };
}

/**
 * Enciende/apaga un módulo opcional.
 * @param {string} id  id del módulo ('classes' | 'trainers' | 'reports')
 * @param {boolean} on
 * @returns {Promise<Record<string, boolean>>} los flags resultantes
 */
export async function setModuleFlag(id, on) {
  const next = { ...(await getModuleFlags()), [id]: on };
  save('moduleFlags', next);
  return next;
}
