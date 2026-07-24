/*
  services/settingsService.js — Configuración de la app (mock → API mañana).

  Como todos los services: funciones ASYNC aunque el mock sea síncrono.
  Así, cuando esto sea un fetch a la API, ni los hooks ni los componentes
  cambian — solo cambia el interior de este archivo (ARQUITECTURA §9).

  Fase 0: solo apariencia (tema) y flags de módulos.
  Fase 7 amplía: datos del gimnasio, toggles de notificación y respaldos.
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

/* ── Datos del gimnasio (Ajustes → Datos del gimnasio) ─────────────────── */

/** Valores por defecto = los del prototipo. `mono` = mostrar en monoespaciada. */
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

const DEFAULT_GYM = Object.fromEntries(GYM_FIELDS.map((f) => [f.key, f.def]));

/** @returns {Promise<Object>} datos del gimnasio (con defaults). */
export async function getGymInfo() {
  return { ...DEFAULT_GYM, ...load('gymInfo', {}) };
}

/** Guarda un campo de los datos del gimnasio. @returns {Promise<Object>} */
export async function setGymField(key, value) {
  const next = { ...(await getGymInfo()), [key]: value };
  save('gymInfo', next);
  return next;
}

/* ── Notificaciones (Ajustes → Notificaciones) ─────────────────────────── */

/** Interruptores de avisos + canales (por defecto los del prototipo). */
const DEFAULT_NOTIFICATIONS = {
  rem3: true, remDay: true, stockLow: true, dailySummary: false,
  chWhats: true, chMail: true, chSms: false,
};

/** @returns {Promise<Record<string, boolean>>} */
export async function getNotifications() {
  return { ...DEFAULT_NOTIFICATIONS, ...load('notifications', {}) };
}

/** Cambia un interruptor de notificación. @returns {Promise<Object>} */
export async function setNotification(key, on) {
  const next = { ...(await getNotifications()), [key]: on };
  save('notifications', next);
  return next;
}

/* ── Respaldos (Ajustes → Respaldos y datos) ───────────────────────────── */

const DEFAULT_BACKUP = { auto: true, last: '12/07/2026 · 03:00' };

/** @returns {Promise<{auto: boolean, last: string}>} */
export async function getBackup() {
  return { ...DEFAULT_BACKUP, ...load('backup', {}) };
}

/** Enciende/apaga la copia automática. @returns {Promise<Object>} */
export async function setAutoBackup(on) {
  const next = { ...(await getBackup()), auto: on };
  save('backup', next);
  return next;
}

/** Registra una copia "creada ahora" (sella la fecha actual). @returns {Promise<Object>} */
export async function runBackup() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const stamp = `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} · ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const next = { ...(await getBackup()), last: stamp };
  save('backup', next);
  return next;
}
