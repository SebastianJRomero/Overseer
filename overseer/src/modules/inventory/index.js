/*
  modules/inventory/index.js — Meta del módulo Inventario.

  El registry solo importa este index; el resto de la carpeta es asunto
  interno del módulo (ARQUITECTURA §3 y §4). Los tres sub-inventarios se
  registran aparte en inventoryTabs.js (mismo patrón, un nivel más abajo).
*/

import InventoryModule from './InventoryModule';

export default {
  id: 'inventory',
  label: 'Inventario',
  icon: 'inventory',
  core: true,        // módulo núcleo: no se puede ocultar desde Ajustes
  order: 50,
  Component: InventoryModule,
};
