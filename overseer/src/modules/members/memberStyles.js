/*
  modules/members/memberStyles.js — Mapas de color del dominio de miembros.

  Dos vocabularios visuales del prototipo, centralizados para que la tabla,
  la ficha, los chips y el modal de filtro pinten SIEMPRE igual:
    - ESTADO_STYLES: vigente/pronto/vencido → color, fondo y punto.
    - PLAN_STYLES:   cada plan tiene su pareja color/fondo propia.

  Solo estilos y etiquetas; la REGLA de qué estado tiene un miembro vive en
  lib/memberStatus.js.
*/

import { STATUS } from '../../lib/memberStatus';

/** Estilo visual + etiqueta de cada estado de membresía. */
export const ESTADO_STYLES = {
  [STATUS.VIGENTE]: {
    label: 'Vigente',
    color: 'var(--ok)',
    bg: 'var(--ok-bg)',
    dot: 'var(--ok-strong)',
  },
  [STATUS.PRONTO]: {
    // En la tabla el prototipo muestra "Vigente" (el aviso va aparte en
    // ámbar); la etiqueta 'Vence pronto' se usa en chips y filtros.
    label: 'Vence pronto',
    color: 'var(--warn)',
    bg: 'var(--warn-bg)',
    dot: 'var(--warn)',
  },
  [STATUS.VENCIDO]: {
    label: 'Vencido',
    color: 'var(--danger)',
    bg: 'var(--danger-bg)',
    dot: 'var(--danger-strong)',
  },
};

/** Pareja color/fondo de cada plan (badges "Membresía" del prototipo). */
export const PLAN_STYLES = {
  'Quincena': { color: 'var(--text-soft)', bg: 'var(--surface-3)' },
  '1 mes': { color: 'var(--info)', bg: 'var(--info-bg)' },
  '2 meses': { color: 'var(--ok)', bg: 'var(--ok-bg)' },
  '3 meses': { color: 'var(--danger)', bg: 'var(--danger-bg)' },
  'Especial': { color: 'var(--holiday)', bg: 'var(--surface-3)' },
};

/** Estilo de plan con fallback (planes nuevos aún sin color propio). */
export function getPlanStyle(tipo) {
  return PLAN_STYLES[tipo] || PLAN_STYLES['1 mes'];
}
