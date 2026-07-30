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
  "Especial" NO es un plan del catálogo (Ajustes → Planes): es un tipo de
  membresía sin fecha de fin. El wizard lo ofrece aparte, además de los planes
  activos del catálogo.
*/
export const SPECIAL_PLAN = 'Especial';

/*
  Presets de duración de los planes ESTÁNDAR del prototipo.
  "Quincena" suma días; los planes de meses suman meses CALENDARIO
  (1 mes = mismo día del mes siguiente, no 30 días — así cobra el gimnasio).
  Se conservan para NO cambiar esa regla en los planes estándar; los planes
  personalizados del catálogo (con su propio `duracionDias`) caen al cálculo
  por días. "Especial" no tiene fin predeterminado.
*/
const PLAN_PRESETS = {
  'Quincena': (inicio) => addDays(inicio, 15),
  '1 mes': (inicio) => addMonths(inicio, 1),
  '2 meses': (inicio) => addMonths(inicio, 2),
  '3 meses': (inicio) => addMonths(inicio, 3),
  [SPECIAL_PLAN]: () => '', // sin fecha de fin
};

/**
 * Lista de respaldo de planes (solo si el catálogo del backend no cargó).
 * La fuente real es `plansService.listActivePlans()` — Ajustes → Planes.
 */
export const PLAN_OPTIONS = ['Quincena', '1 mes', '2 meses', '3 meses', SPECIAL_PLAN];

/**
 * Calcula la fecha de fin automática de un plan.
 * - Plan estándar (o "Especial") → preset de meses calendario (regla del gimnasio).
 * - Plan del catálogo sin preset → suma `duracionDias` (plan personalizado).
 * Devuelve '' si el plan no tiene fin (Especial) o el inicio no es válido; la
 * UI muestra el campo vacío y el usuario puede fijarlo a mano.
 * @param {string} tipo            nombre del plan ('1 mes', 'Quincena', ...)
 * @param {string} inicio          fecha "dd/mm/aaaa"
 * @param {number} [duracionDias]  duración del plan del catálogo (fallback)
 * @returns {string}
 */
export function computeFin(tipo, inicio, duracionDias) {
  if (PLAN_PRESETS[tipo]) return PLAN_PRESETS[tipo](inicio);
  if (duracionDias > 0) return addDays(inicio, duracionDias);
  return PLAN_PRESETS['1 mes'](inicio);
}
