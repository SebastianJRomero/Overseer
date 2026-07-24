/*
  modules/reports/index.js — Meta del módulo Reportes (OPCIONAL).

  core:false → se puede ocultar desde Ajustes → Módulos. order 55 lo sitúa
  entre Inventario (50) y Ajustes (60), como en el prototipo.
*/

import ReportsModule from './ReportsModule';

export default {
  id: 'reports',
  label: 'Reportes',
  icon: 'reports',
  core: false,
  order: 55,
  Component: ReportsModule,
};
