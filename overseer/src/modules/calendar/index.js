/*
  modules/calendar/index.js — Meta del módulo Calendario.

  El registry solo importa este index; el resto de la carpeta es asunto
  interno del módulo (ARQUITECTURA §3 y §4).
*/

import CalendarModule from './CalendarModule';

export default {
  id: 'calendar',
  label: 'Calendario',
  icon: 'calendar',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 30,
  Component: CalendarModule,
};
