/*
  services/maintenanceService.js — Mantenimiento del sistema (menú avanzado).

  Único punto que orquesta las acciones destructivas del Tramo C · frente 5:
  respaldo/restauración COMPLETOS (BD del backend + config local del navegador),
  borrado selectivo por entidad y reset total. La UI (MaintenanceSection) solo
  llama a estas funciones; el detalle (API + storage) queda oculto aquí
  (ARQUITECTURA §9). Todas son async.
*/

import { apiGet, apiPost, apiDelete } from './api';
import * as storage from './storage';

/* Config LOCAL que entra en el respaldo (lo que aún vive en localStorage, no en
   la BD). NO incluimos 'auth' (la sesión): un respaldo no debe llevar la sesión
   de quien exporta, y el reset no debe cerrarle la sesión al que lo ejecuta. */
const CONFIG_KEYS = ['apariencia', 'moduleFlags'];

/**
 * Arma un respaldo completo { version, exportedAt, db, local }.
 * @returns {Promise<object>}
 */
export async function exportBundle() {
  const db = await apiGet('/maintenance/export');
  const all = storage.exportAll();
  const local = {};
  for (const k of CONFIG_KEYS) if (all[k] !== undefined && all[k] !== null) local[k] = all[k];
  return { version: 1, exportedAt: new Date().toISOString(), db, local };
}

/**
 * Restaura desde un respaldo (el JSON que produjo exportBundle).
 * @param {object} bundle
 * @throws si el archivo no tiene la forma esperada
 */
export async function importBundle(bundle) {
  if (!bundle || typeof bundle !== 'object' || !bundle.db || typeof bundle.db !== 'object') {
    throw new Error('Archivo inválido: falta la sección "db".');
  }
  await apiPost('/maintenance/import', bundle.db);
  if (bundle.local && typeof bundle.local === 'object') storage.importAll(bundle.local);
}

/**
 * Borra los registros de una entidad (por su nombre amigable del backend).
 * @param {string} name  'miembros' | 'movimientos' | 'inventario' | ...
 * @returns {Promise<*>}
 */
export async function clearEntity(name) {
  return apiDelete(`/maintenance/entity/${name}`);
}

/**
 * Reset total: borra y resiembra la BD, y resetea la config local (tema/flags)
 * SIN cerrar la sesión (se conserva 'auth').
 * @returns {Promise<void>}
 */
export async function resetAll() {
  await apiPost('/maintenance/reset');
  storage.clearAll(['auth']);
}

/* Entidades que ofrece el borrado selectivo (etiqueta para la UI). El `name`
   debe coincidir con las claves de ENTITY_TABLES en routes/maintenance.js. */
export const ENTITIES = [
  { name: 'miembros', label: 'Miembros' },
  { name: 'movimientos', label: 'Movimientos (Finanzas)' },
  { name: 'eventos', label: 'Eventos (Calendario)' },
  { name: 'inventario', label: 'Inventario (productos, equipos y gas)' },
  { name: 'planes', label: 'Planes' },
  { name: 'cuentas', label: 'Cuentas de usuario' },
  { name: 'clases', label: 'Clases' },
  { name: 'entrenadores', label: 'Entrenadores' },
];
