/*
  lib/inventoryStatus.js — Reglas de negocio del inventario.

  Igual que memberStatus para los miembros: el ESTADO de un producto se
  DERIVA de su stock, nunca se guarda. Una sola fuente de verdad para la
  tabla, los KPIs y el badge — si mañana cambia el umbral, se cambia aquí.

  También centraliza las listas cerradas (categorías de producto y estados
  de equipo) que alimentan los selectores de los modales.
*/

/** Estados posibles de un producto en venta. */
export const PRODUCT_STATUS = {
  EN_STOCK: 'En stock',
  BAJO: 'Bajo',
  AGOTADO: 'Agotado',
};

/** A partir de cuántas unidades se considera "stock bajo" (incluido). */
const LOW_STOCK = 5;

/**
 * Deriva el estado de un producto según su stock.
 * - 0 unidades          → Agotado.
 * - 1..5 unidades       → Bajo.
 * - más de 5            → En stock.
 * @param {number} stock
 * @returns {'En stock'|'Bajo'|'Agotado'}
 */
export function getProductStatus(stock) {
  const n = Number(stock) || 0;
  if (n === 0) return PRODUCT_STATUS.AGOTADO;
  if (n <= LOW_STOCK) return PRODUCT_STATUS.BAJO;
  return PRODUCT_STATUS.EN_STOCK;
}

/** Categorías que ofrece el gimnasio (orden de los selectores). */
export const PRODUCT_CATEGORIES = ['Bebidas', 'Suplementos', 'Accesorios', 'Otros'];

/** Estados que puede tener una máquina/equipo (orden del selector). */
export const EQUIPMENT_STATES = ['Operativo', 'Mantenimiento', 'Fuera de servicio'];
