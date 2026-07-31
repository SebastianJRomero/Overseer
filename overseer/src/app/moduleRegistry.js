/*
  moduleRegistry.js — FUENTE ÚNICA de verdad de los módulos (ARQUITECTURA §4).

  Cada módulo vive en su carpeta bajo modules/ y exporta un "meta":
    { id, label, icon, core, order, Component }

  Con este registro se consiguen las 5 capacidades pedidas:
    AGREGAR    → crear la carpeta del módulo + añadir UNA línea aquí.
    QUITAR     → borrar la carpeta + quitar la línea. La app sigue compilando.
    REEMPLAZAR → apuntar Component a otra implementación en el meta.
    OCULTAR    → moduleFlags[id] = false (solo opcionales) — es el toggle
                 de Ajustes → Módulos; el código no se borra.
    REUTILIZAR → TopBar y ModuleHost derivan TODO de esta lista; nunca hay
                 listas de módulos duplicadas en el código.

  Cada fase agrega su módulo real con UNA línea en este array (el módulo
  demo de la Fase 0 ya cumplió su papel y salió al entrar 'dashboard').
*/

import dashboard from '../modules/dashboard';
import members from '../modules/members';
import calendar from '../modules/calendar';
import finance from '../modules/finance';
import inventory from '../modules/inventory';
import settings from '../modules/settings';
import classes from '../modules/classes';
import trainers from '../modules/trainers';
import reports from '../modules/reports';

// El orden visible lo decide meta.order (getVisibleModules ordena por él),
// no la posición en este array. Los opcionales (classes/trainers/reports)
// tienen core:false → solo aparecen si su flag no está apagado.
export const MODULES = [dashboard, members, calendar, finance, inventory, settings, classes, trainers, reports];

/** A dónde vuelve la app cuando se oculta el módulo activo (será 'dashboard'). */
export const DEFAULT_MODULE_ID = MODULES[0].id;

/*
  Enforcement de permisos (Tramo C). Cada módulo exige una FUNCIÓN de acceso
  (las de rolePermissions/usersService) para verse en usuarios NO-Admin. Los que
  no figuran aquí no exigen permiso: 'dashboard' (Inicio) es el hogar y se ve
  siempre. 'trainers' va con 'Clases' (los entrenadores viven con las clases; el
  rol Entrenador tiene 'Clases'). El Admin y el superusuario ven TODO.
*/
const MODULE_PERM = {
  members: 'Miembros',
  calendar: 'Calendario',
  finance: 'Finanzas',
  inventory: 'Inventario',
  classes: 'Clases',
  trainers: 'Clases',
  reports: 'Reportes',
  settings: 'Ajustes',
};

/**
 * ¿La sesión puede acceder a un módulo? El Admin/superusuario siempre; el resto
 * solo si sus `permisos` incluyen la función que el módulo exige (o si no exige
 * ninguna, como Inicio).
 * @param {string} id                          id del módulo
 * @param {{isSuper?, role?, permisos?}} sess   datos de sesión (useSession)
 * @returns {boolean}
 */
export function canAccessModule(id, sess = {}) {
  if (sess.isSuper || sess.role === 'Admin') return true;
  const need = MODULE_PERM[id];
  if (!need) return true; // módulo sin permiso requerido (Inicio)
  return (sess.permisos || []).includes(need);
}

/**
 * ¿La sesión tiene una FUNCIÓN de acceso puntual? (permisos de grano fino que no
 * mapean a un módulo, como 'Editar miembros'). El Admin/superusuario siempre; el
 * resto solo si sus `permisos` la incluyen. Es el mismo criterio que
 * canAccessModule pero para una función concreta.
 * @param {{isSuper?, role?, permisos?}} sess   datos de sesión (useSession)
 * @param {string} fn                           función (p. ej. 'Editar miembros')
 * @returns {boolean}
 */
export function hasPermission(sess = {}, fn) {
  if (sess.isSuper || sess.role === 'Admin') return true;
  return (sess.permisos || []).includes(fn);
}

/**
 * Módulos visibles en la navegación: los core siempre (frente a flags); los
 * opcionales solo si su flag no está apagado; y —si se pasa la sesión— solo los
 * que el usuario tiene permiso de ver. Ordenados por meta.order.
 * @param {Record<string, boolean>} flags   moduleFlags de ModulesProvider
 * @param {{isSuper?, role?, permisos?}|null} sess  sesión para filtrar por
 *        permisos; null/omitido = sin filtro de permisos (compat)
 * @returns {Array} lista de metas visibles
 */
export function getVisibleModules(flags = {}, sess = null) {
  return MODULES
    .filter((m) => m.core || flags[m.id] !== false)
    .filter((m) => !sess || canAccessModule(m.id, sess))
    .sort((a, b) => a.order - b.order);
}

/**
 * Busca el meta de un módulo por id (para que ModuleHost sepa qué montar).
 * @param {string} id
 * @returns {object|undefined}
 */
export function getModule(id) {
  return MODULES.find((m) => m.id === id);
}
