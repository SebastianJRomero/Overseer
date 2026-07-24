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

export const MODULES = [dashboard, members, calendar, finance, inventory, settings];

/** A dónde vuelve la app cuando se oculta el módulo activo (será 'dashboard'). */
export const DEFAULT_MODULE_ID = MODULES[0].id;

/**
 * Módulos visibles en la navegación: los core siempre; los opcionales solo
 * si su flag no está apagado. Ordenados por meta.order.
 * @param {Record<string, boolean>} flags  moduleFlags de ModulesProvider
 * @returns {Array} lista de metas visibles
 */
export function getVisibleModules(flags = {}) {
  return MODULES
    .filter((m) => m.core || flags[m.id] !== false)
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
