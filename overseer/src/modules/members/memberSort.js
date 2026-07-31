/*
  modules/members/memberSort.js — Orden de la tabla de miembros (lógica pura).

  El orden se controla haciendo clic en los ENCABEZADOS de la tabla (no hay barra
  aparte): un clic ordena por esa columna, otro clic invierte. Solo la columna
  activa muestra la flecha. Columnas ordenables:
    - nombre → alfabético (A–Z / Z–A).
    - fin    → por fecha de fin; arranca en "recientes" (fin más próximo primero).
    - estado → por estado (vencido → vence pronto → vigente).
    - tipo   → por nombre de la membresía (alfabético).
    - recibo → por N° de recibo (comparación numérica-natural).

  El estado de orden es { field, dir } con dir ∈ 'asc' | 'desc'. Para cada campo,
  `dir:'asc'` es su sentido natural; `dir:'desc'` lo invierte. A-Z (nombre asc) es
  el defecto. Se separa del componente para no romper fast-refresh.
*/

import { parseDMY } from '../../lib/date';
import { STATUS } from '../../lib/memberStatus';

/** Orden por defecto: alfabético ascendente (A–Z). */
export const DEFAULT_SORT = { field: 'nombre', dir: 'asc' };

/* Dirección al ACTIVAR cada campo por primera vez (clic en un encabezado nuevo).
   'fin' arranca en 'desc' = recientes primero; el resto en su sentido natural. */
export const DEFAULT_DIR = { nombre: 'asc', fin: 'desc', estado: 'asc', tipo: 'asc', recibo: 'asc' };

/** Peso de estado para ordenar: primero lo más urgente. */
const STATUS_RANK = { [STATUS.VENCIDO]: 0, [STATUS.PRONTO]: 1, [STATUS.VIGENTE]: 2 };

/** dd/mm/aaaa → milisegundos comparables (fechas inválidas van al final). */
const finTime = (m) => {
  const d = parseDMY(m.fin);
  return d ? d.getTime() : Number.POSITIVE_INFINITY;
};

/**
 * Ordena una lista de miembros ya filtrada.
 * @param {Array} list      miembros visibles (con `status` derivado)
 * @param {{field, dir}} sort
 * @returns {Array} nueva lista ordenada
 */
export function sortMembers(list, sort) {
  const base = {
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
    fin: (a, b) => finTime(a) - finTime(b),
    estado: (a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9),
    tipo: (a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'es', { sensitivity: 'base' }),
    recibo: (a, b) => String(a.recibo || '').localeCompare(String(b.recibo || ''), 'es', { numeric: true, sensitivity: 'base' }),
  }[sort.field] || (() => 0);

  const mult = sort.dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => base(a, b) * mult);
}
