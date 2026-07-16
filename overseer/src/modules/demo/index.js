/*
  modules/demo/index.js — Meta del módulo de demostración.

  Todo módulo expone este contrato (ARQUITECTURA §4). El registry solo
  importa este index; el resto de la carpeta es asunto interno del módulo.
*/

import DemoModule from './DemoModule';

export default {
  id: 'demo',
  label: 'Demo',
  icon: 'dashboard',
  core: true,       // los core no se pueden ocultar desde Ajustes
  order: 10,
  Component: DemoModule,
};
