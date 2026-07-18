/*
  modules/members/index.js — Meta del módulo de miembros.

  El registry solo importa este index; el resto de la carpeta es asunto
  interno del módulo (ARQUITECTURA §3 y §4).
*/

import MembersModule from './MembersModule';

export default {
  id: 'members',
  label: 'Miembros',
  icon: 'members',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 20,
  Component: MembersModule,
};
