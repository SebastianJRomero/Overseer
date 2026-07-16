/*
  lib/memberStatus.js — Reglas de negocio de las membresías.

  Aquí viven las DOS reglas más importantes del gimnasio:
    1. El estado de un miembro (vigente / vence pronto / vencido) se DERIVA
       de su fecha de fin — nunca se guarda. Así la misma regla alimenta el
       Inicio, los chips de Miembros y los filtros de KPI: una sola fuente
       de verdad (ARQUITECTURA §8).
    2. La fecha de fin se calcula automáticamente según el plan elegido
       (computeFin), aunque el usuario siempre puede editarla después.
*/

import { parseDMY, addDays, addMonths, todayAtMidnight, diffDays } from './date';

/** Estados posibles de un miembro. Usamos constantes para evitar typos. */
export const STATUS = {
  VIGENTE: 'vigente',
  PRONTO: 'pronto', // vence dentro de los próximos 7 días
  VENCIDO: 'vencido',
};

/** Un miembro "vence pronto" si su fin cae dentro de esta ventana de días. */
const SOON_WINDOW_DAYS = 7;

/**
 * Deriva el estado de un miembro a partir de su fecha de fin.
 * - Sin fecha de fin (plan "Especial") → siempre vigente.
 * - hoy > fin                          → vencido.
 * - fin ≤ hoy + 7 días                 → vence pronto.
 * @param {{fin?: string}} member  objeto con fecha fin "dd/mm/aaaa"
 * @param {Date} [today]           inyectable para poder probar la regla
 * @returns {'vigente'|'pronto'|'vencido'}
 */
export function getMemberStatus(member, today = todayAtMidnight()) {
  const fin = parseDMY(member.fin);
  if (!fin) return STATUS.VIGENTE;
  const days = diffDays(today, fin); // días que faltan (negativo = ya pasó)
  if (days < 0) return STATUS.VENCIDO;
  if (days <= SOON_WINDOW_DAYS) return STATUS.PRONTO;
  return STATUS.VIGENTE;
}

/*
  Presets de duración por plan (los 5 planes del prototipo).
  "Quincena" suma días; los planes de meses suman meses CALENDARIO
  (1 mes = mismo día del mes siguiente, no 30 días — así cobra el gimnasio).
  "Especial" no tiene fin predeterminado.
*/
const PLAN_PRESETS = {
  'Quincena': (inicio) => addDays(inicio, 15),
  '1 mes': (inicio) => addMonths(inicio, 1),
  '2 meses': (inicio) => addMonths(inicio, 2),
  '3 meses': (inicio) => addMonths(inicio, 3),
  'Especial': () => '', // sin fecha de fin
};

/** Lista de planes en el orden en que se muestran en la UI. */
export const PLAN_OPTIONS = ['Quincena', '1 mes', '2 meses', '3 meses', 'Especial'];

/**
 * Calcula la fecha de fin automática según el plan.
 * Devuelve '' si el inicio no es válido o el plan no tiene fin (Especial):
 * la UI muestra el campo vacío y el usuario puede fijarlo a mano.
 * @param {string} tipo   nombre del plan ('1 mes', 'Quincena', ...)
 * @param {string} inicio fecha "dd/mm/aaaa"
 * @returns {string}
 */
export function computeFin(tipo, inicio) {
  const preset = PLAN_PRESETS[tipo] || PLAN_PRESETS['1 mes'];
  return preset(inicio);
}
