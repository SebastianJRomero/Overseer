/*
  modules/settings/index.js — Meta del módulo Ajustes.

  El registry solo importa este index; el resto de la carpeta es asunto
  interno del módulo (ARQUITECTURA §3 y §4). Las 7 sub-secciones se registran
  aparte en settingsSections.js (mismo patrón, un nivel más abajo).
*/

import SettingsModule from './SettingsModule';

export default {
  id: 'settings',
  label: 'Ajustes',
  icon: 'settings',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 60,
  Component: SettingsModule,
};
