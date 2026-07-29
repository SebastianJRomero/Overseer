/*
  services/inventoryService.js — Inventario completo (API real: Node + Express + SQLite).

  Tres sub-inventarios servidos por el backend:
    - products    productos en venta
    - equipment   máquinas y equipos
    - gas         cilindros de la zona húmeda (con métricas derivadas)

  Los ESTADOS y las MÉTRICAS se derivan en el backend (getProductStatus vive en
  lib para la UI; las del gas las calcula el servidor en computeCylinder), nunca
  se guardan. Las firmas y formas de retorno son iguales que en el mock, así que
  el hook y los componentes no cambian (ARQUITECTURA §9).

  Nota de compatibilidad: `listProducts()` la consume también el catálogo del
  modal de movimientos (Finanzas) — devuelve productos con `nombre` y `venta`.
*/

import { apiGet, apiPost, apiPatch, apiDelete } from './api';

/* ══════════════════ PRODUCTOS ══════════════════ */

/** @returns {Promise<Array>} productos { id, nombre, categoria, stock, venta, compra } */
export async function listProducts() {
  return apiGet('/inventory/products');
}

/** Crea un producto. @returns {Promise<Array>} lista actualizada */
export async function createProduct(data) {
  return apiPost('/inventory/products', data);
}

/** Actualiza un producto por id. @returns {Promise<Array>} lista actualizada */
export async function updateProduct(id, patch) {
  return apiPatch(`/inventory/products/${id}`, patch);
}

/** Elimina un producto por id. @returns {Promise<Array>} lista actualizada */
export async function deleteProduct(id) {
  return apiDelete(`/inventory/products/${id}`);
}

/**
 * Descuenta del stock las unidades vendidas en un movimiento de entrada.
 * Los artículos viajan como { nombre: cantidad }; el backend descuenta por
 * NOMBRE (los escritos a mano no coinciden y no afectan stock) y nunca baja
 * de 0. Se coordina desde el hook al registrar una venta.
 * @param {Object<string, number>} items  { nombre: cantidad }
 * @returns {Promise<Array>} lista de productos actualizada
 */
export async function applySale(items) {
  return apiPost('/inventory/products/apply-sale', { items: items || {} });
}

/* ══════════════════ EQUIPOS ══════════════════ */

/** @returns {Promise<Array>} equipos { id, nombre, cantidad, estado, revision, obs } */
export async function listEquipment() {
  return apiGet('/inventory/equipment');
}

/** Crea un equipo. @returns {Promise<Array>} lista actualizada */
export async function createEquipment(data) {
  return apiPost('/inventory/equipment', data);
}

/** Actualiza un equipo por id. @returns {Promise<Array>} lista actualizada */
export async function updateEquipment(id, patch) {
  return apiPatch(`/inventory/equipment/${id}`, patch);
}

/* ══════════════════ GAS (zona húmeda) ══════════════════ */

/** @returns {Promise<Array>} cilindros CON métricas derivadas (backend) */
export async function listCylinders() {
  return apiGet('/inventory/gas');
}

/** Registra la compra de un cilindro nuevo (queda "en uso", sin usos). */
export async function createPurchase({ destino, compra, precio, capLb }) {
  return apiPost('/inventory/gas', { destino, compra, precio, capLb });
}

/** Agrega un uso a un cilindro. */
export async function addUsage(cylId, usage) {
  return apiPost(`/inventory/gas/${cylId}/usage`, usage);
}

/** Edita un uso existente de un cilindro. */
export async function updateUsage(cylId, usoId, patch) {
  return apiPatch(`/inventory/gas/${cylId}/usage/${usoId}`, patch);
}

/** Elimina un uso de un cilindro. */
export async function deleteUsage(cylId, usoId) {
  return apiDelete(`/inventory/gas/${cylId}/usage/${usoId}`);
}

/** Marca un cilindro como finalizado (fija la fecha y el total de usos). */
export async function finalizeCylinder(cylId, { fechaFin, usosFinal, obsFin }) {
  return apiPost(`/inventory/gas/${cylId}/finalize`, { fechaFin, usosFinal, obsFin });
}
