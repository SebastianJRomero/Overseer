/*
  modules/classes/index.js — Meta del módulo Clases (OPCIONAL).

  core:false → se puede ocultar desde Ajustes → Módulos. order 35 lo sitúa
  entre Calendario (30) y Finanzas (40), como en el prototipo.
*/

import ClassesModule from './ClassesModule';

export default {
  id: 'classes',
  label: 'Clases',
  icon: 'classes',
  core: false,
  order: 35,
  Component: ClassesModule,
};
