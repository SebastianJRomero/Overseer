/*
  modules/dashboard/index.js — Meta del módulo Inicio.

  Ocupa el lugar (y el id) que el registry reservaba con el módulo demo:
  'dashboard' es además DEFAULT_MODULE_ID, el sitio al que vuelve la app
  cuando se oculta el módulo activo (ARQUITECTURA §4).
*/

import DashboardModule from './DashboardModule';

export default {
  id: 'dashboard',
  label: 'Inicio',
  icon: 'dashboard',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 10,
  Component: DashboardModule,
};
