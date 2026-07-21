/*
  modules/finance/index.js — Meta del módulo Finanzas.

  El registry solo importa este index; el resto de la carpeta es asunto
  interno del módulo (ARQUITECTURA §3 y §4).
*/

import FinanceModule from './FinanceModule';

export default {
  id: 'finance',
  label: 'Finanzas',
  icon: 'finance',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 40,
  Component: FinanceModule,
};
