/*
  services/inventoryService.js — Inventario (mock hoy → API mañana).

  Por ahora solo expone los PRODUCTOS, que el modal de movimientos de
  Finanzas (fase 4) necesita para su catálogo. El módulo de Inventario
  (fase 6) ampliará este servicio con equipos, zona húmeda (gas) y el CRUD
  completo, sin cambiar esta firma.

  Producto: { id, nombre, categoria, stock, venta (número), compra (número) }
*/

import { load, save } from './storage';
import { SEED_PRODUCTS } from '../data/seedProducts';

const KEY = 'products';

/** Lee la lista, sembrando los productos de ejemplo la primera vez. */
function readProducts() {
  let products = load(KEY, null);
  if (!products) {
    products = SEED_PRODUCTS;
    save(KEY, products);
  }
  return products;
}

/**
 * Productos en venta (para el catálogo del modal de movimientos y, en la
 * fase 6, para la tabla de Inventario).
 * @returns {Promise<Array>}
 */
export async function listProducts() {
  return readProducts();
}
