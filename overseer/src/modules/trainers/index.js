/*
  modules/trainers/index.js — Meta del módulo Entrenadores (OPCIONAL).

  core:false → se puede ocultar desde Ajustes → Módulos. order 38 lo sitúa
  entre Clases (35) y Finanzas (40), como en el prototipo.
*/

import TrainersModule from './TrainersModule';

export default {
  id: 'trainers',
  label: 'Entrenadores',
  icon: 'trainers',
  core: false,
  order: 38,
  Component: TrainersModule,
};
