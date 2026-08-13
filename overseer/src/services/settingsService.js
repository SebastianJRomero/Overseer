/*
  services/settingsService.js — Configuración de la app (mock/local + API).

  Fase 10: este service quedó HÍBRIDO a propósito.

    · Apariencia (accent/density/roundness) y flags de módulos → siguen en
      localStorage. Por decisión #2 el tema se persiste local, y ambos se leen
      AL ARRANCAR (ThemeProvider / ModulesProvider), así que no deben depender
      de que el servidor esté arriba. Su interior no cambió.

    · Datos del gimnasio, notificaciones y respaldos → ahora van al backend
      (/api/settings/*). Solo se leen dentro del módulo de Ajustes.

  GYM_FIELDS es metadato estático de UI (labels + defaults) y se queda aquí.
  Todas las funciones son async (ARQUITECTURA §9).
*/

import { load, save } from './storage';
import { apiGet, apiPatch, apiPost, apiDelete, apiDownload } from './api';
import { downloadBlob } from '../lib/download';

/* ── Apariencia (local — decisión #2) ──────────────────────────────────── */

/** Valores por defecto = los defaults del prototipo. */
const DEFAULT_APPEARANCE = {
  tema: 'oscuro',         // oscuro | claro  (OVERSEER nació solo-oscuro)
  accent: 'coral',        // coral | electrico | oceano | purpura
  density: 'comodo',      // compacto | comodo | espacioso
  roundness: 'redondeado', // nitido | redondeado | suave
  zoom: 100,              // % de zoom de la interfaz (85–115) — control del menú de usuario
};

/** @returns {Promise<{tema, accent, density, roundness, zoom}>} */
export async function getAppearance() {
  return { ...DEFAULT_APPEARANCE, ...load('apariencia', {}) };
}

/**
 * Guarda uno o varios ejes de apariencia.
 * @param {Partial<{tema, accent, density, roundness, zoom}>} patch
 * @returns {Promise<object>} la apariencia resultante
 */
export async function setAppearance(patch) {
  const next = { ...(await getAppearance()), ...patch };
  save('apariencia', next);
  return next;
}

/* ── Flags de módulos opcionales (local — se leen al arrancar) ──────────── */

/** Por defecto los tres opcionales están encendidos, como en el prototipo. */
const DEFAULT_FLAGS = { classes: true, trainers: true, reports: true };

/** @returns {Promise<Record<string, boolean>>} id de módulo → visible */
export async function getModuleFlags() {
  return { ...DEFAULT_FLAGS, ...load('moduleFlags', {}) };
}

/**
 * Enciende/apaga un módulo opcional.
 * @param {string} id  'classes' | 'trainers' | 'reports'
 * @param {boolean} on
 * @returns {Promise<Record<string, boolean>>} los flags resultantes
 */
export async function setModuleFlag(id, on) {
  const next = { ...(await getModuleFlags()), [id]: on };
  save('moduleFlags', next);
  return next;
}

/* ── Datos del gimnasio (backend) ──────────────────────────────────────── */

/** Metadato de los campos (labels + defaults). `mono` = mostrar en monoespaciada. */
export const GYM_FIELDS = [
  { key: 'nombre', label: 'Nombre del gimnasio', def: 'OVERSEER Fitness Club', mono: false },
  { key: 'direccion', label: 'Dirección', def: 'Cra 43A #7-50, Medellín', mono: false },
  { key: 'telefono', label: 'Teléfono', def: '+57 604 444 8890', mono: true },
  { key: 'correo', label: 'Correo', def: 'contacto@overseer.gym', mono: false },
  { key: 'horarioSem', label: 'Horario entre semana', def: '05:00 — 22:00', mono: true },
  { key: 'horarioFin', label: 'Horario fin de semana', def: '07:00 — 14:00', mono: true },
  { key: 'moneda', label: 'Moneda', def: 'COP ($)', mono: true },
  { key: 'zona', label: 'Zona horaria', def: 'GMT-5 · Bogotá', mono: true },
];

/** @returns {Promise<Object>} datos del gimnasio (el backend mezcla defaults). */
export async function getGymInfo() {
  return apiGet('/settings/gym');
}

/** Guarda un campo de los datos del gimnasio. @returns {Promise<Object>} */
export async function setGymField(key, value) {
  return apiPatch('/settings/gym', { key, value });
}

/* ── Notificaciones (backend) ──────────────────────────────────────────── */

/** @returns {Promise<Record<string, boolean>>} */
export async function getNotifications() {
  return apiGet('/settings/notifications');
}

/** Cambia un interruptor de notificación. @returns {Promise<Object>} */
export async function setNotification(key, on) {
  return apiPatch('/settings/notifications', { key, on });
}

/* ── Respaldos (backend) ───────────────────────────────────────────────── */

/** @returns {Promise<{auto: boolean, last: string, lastFile?: string}>} */
export async function getBackup() {
  return apiGet('/settings/backup');
}

/** Enciende/apaga la copia automática. @returns {Promise<Object>} */
export async function setAutoBackup(on) {
  return apiPatch('/settings/backup', { auto: on });
}

/** Crea una copia REAL de la BD (snapshot .db en el server). @returns {Promise<Object>} */
export async function runBackup() {
  return apiPost('/settings/backup/run');
}

/** Lista las copias guardadas: { files: [{ name, size, date }] } más reciente primero. */
export async function listBackups() {
  return apiGet('/settings/backup/files');
}

/** Descarga una copia concreta como archivo .db (dispara el guardado). */
export async function downloadBackup(name) {
  const blob = await apiDownload(`/settings/backup/files/${encodeURIComponent(name)}`);
  downloadBlob(name, blob);
}

/** Restaura la BD actual desde una copia concreta (reemplaza TODO). */
export async function restoreBackup(name) {
  return apiPost(`/settings/backup/files/${encodeURIComponent(name)}/restore`);
}

/** Borra una copia concreta del disco. @returns {Promise<*>} */
export async function deleteBackup(name) {
  return apiDelete(`/settings/backup/files/${encodeURIComponent(name)}`);
}
