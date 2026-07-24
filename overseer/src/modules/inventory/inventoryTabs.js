/*
  modules/inventory/inventoryTabs.js — Registro de sub-inventarios.

  Mismo patrón que moduleRegistry, un nivel más abajo (ARQUITECTURA §4):
  el módulo de Inventario no tiene condicionales por pestaña, sino que mapea
  este array. Agregar un sub-inventario = crear su componente + una línea
  aquí; quitarlo = borrar la línea; reordenar = mover la línea.

  Cada pestaña se auto-describe: { id, label, icon, Component }. El Component
  recibe todo por props desde InventoryModule (datos + acciones de useInventory).
*/

import ProductsTab from './components/ProductsTab';
import EquipmentTab from './components/EquipmentTab';
import GasTab from './components/GasTab';

export const INVENTORY_TABS = [
  { id: 'productos', label: 'Productos en venta', icon: 'inventory', Component: ProductsTab },
  { id: 'equipo', label: 'Equipo de gym', icon: 'diamond', Component: EquipmentTab },
  { id: 'gas', label: 'Zona húmeda', icon: 'gas', Component: GasTab },
];

/** Pestaña por defecto (la primera del registro). */
export const DEFAULT_TAB = INVENTORY_TABS[0].id;
