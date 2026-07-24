/*
  services/inventoryService.js — Inventario completo (mock hoy → API mañana).

  Tres sub-inventarios, cada uno persistido en su propia clave de storage:
    - products    ('products')       productos en venta
    - equipment   ('equipment')      máquinas y equipos
    - gas         ('gasCylinders')   cilindros de la zona húmeda

  Los ESTADOS y las MÉTRICAS se derivan (getProductStatus en lib; las del gas
  aquí en computeCylinder), nunca se guardan. Las funciones son async y
  ocultan el origen: cuando exista API, cambia el interior sin tocar el hook
  ni los componentes (ARQUITECTURA §9).

  Nota de compatibilidad: `listProducts()` la consume también el catálogo del
  modal de movimientos (Finanzas, fase 4) — devuelve los productos con
  `nombre` y `venta`, no cambiar esas claves.
*/

import { load, save } from './storage';
import { newId } from '../lib/id';
import { SEED_PRODUCTS } from '../data/seedProducts';
import { SEED_EQUIPMENT } from '../data/seedEquipment';
import { buildSeedGas } from '../data/seedGas';

const PRODUCTS_KEY = 'products';
const EQUIPMENT_KEY = 'equipment';
const GAS_KEY = 'gasCylinders';

/** Lee una lista de storage, sembrando la semilla la primera vez. */
function readSeeded(key, seed) {
  let list = load(key, null);
  if (!list) {
    list = typeof seed === 'function' ? seed() : seed;
    save(key, list);
  }
  return list;
}

/* ══════════════════ PRODUCTOS ══════════════════ */

/** @returns {Promise<Array>} productos { id, nombre, categoria, stock, venta, compra } */
export async function listProducts() {
  return readSeeded(PRODUCTS_KEY, SEED_PRODUCTS);
}

/** Crea un producto. @returns {Promise<Array>} lista actualizada */
export async function createProduct(data) {
  const list = await listProducts();
  const record = { id: newId('pr'), ...data };
  const next = [...list, record];
  save(PRODUCTS_KEY, next);
  return next;
}

/** Actualiza un producto por id. @returns {Promise<Array>} lista actualizada */
export async function updateProduct(id, patch) {
  const next = (await listProducts()).map((p) => (p.id === id ? { ...p, ...patch } : p));
  save(PRODUCTS_KEY, next);
  return next;
}

/** Elimina un producto por id. @returns {Promise<Array>} lista actualizada */
export async function deleteProduct(id) {
  const next = (await listProducts()).filter((p) => p.id !== id);
  save(PRODUCTS_KEY, next);
  return next;
}

/**
 * Descuenta del stock las unidades vendidas en un movimiento de entrada.
 * Los artículos viajan como { nombre: cantidad } (así los guarda el modal de
 * movimientos). Se hace por NOMBRE porque es la clave que comparte el catálogo
 * de Finanzas; los artículos escritos a mano ("Nuevo artículo") no coinciden
 * con ningún producto y por eso no afectan el inventario — justo lo deseado.
 * El stock nunca baja de 0. Si nada coincide, no escribe (no-op).
 * @param {Object<string, number>} items  { nombre: cantidad }
 * @returns {Promise<Array>} lista de productos actualizada
 */
export async function applySale(items) {
  const list = await listProducts();
  const names = Object.keys(items || {});
  if (names.length === 0) return list;
  let changed = false;
  const next = list.map((p) => {
    const qty = items[p.nombre];
    if (qty == null) return p;
    changed = true;
    return { ...p, stock: Math.max(0, (Number(p.stock) || 0) - Number(qty)) };
  });
  if (changed) save(PRODUCTS_KEY, next);
  return next;
}

/* ══════════════════ EQUIPOS ══════════════════ */

/** @returns {Promise<Array>} equipos { id, nombre, cantidad, estado, revision, obs } */
export async function listEquipment() {
  return readSeeded(EQUIPMENT_KEY, SEED_EQUIPMENT);
}

/** Crea un equipo. @returns {Promise<Array>} lista actualizada */
export async function createEquipment(data) {
  const record = { id: newId('eq'), ...data };
  const next = [...(await listEquipment()), record];
  save(EQUIPMENT_KEY, next);
  return next;
}

/** Actualiza un equipo por id. @returns {Promise<Array>} lista actualizada */
export async function updateEquipment(id, patch) {
  const next = (await listEquipment()).map((e) => (e.id === id ? { ...e, ...patch } : e));
  save(EQUIPMENT_KEY, next);
  return next;
}

/* ══════════════════ GAS (zona húmeda) ══════════════════ */

/**
 * Enriquece un cilindro con sus métricas derivadas:
 *   capUsos    capacidad estimada en usos (≈ libras)
 *   usosCount  usos consumidos (los cerrados usan usosFinal)
 *   restantes  usos que quedan
 *   pct        % consumido (tope 100)
 *   turco/jacuzzi  desglose de usos del compartido
 *   costoUso   precio ÷ capacidad
 */
function computeCylinder(c) {
  const capUsos = Math.max(1, Math.round(c.capLb || 1));
  const usosCount = c.usosFinal != null && c.finalizado ? c.usosFinal : (c.usos || []).length;
  const restantes = Math.max(capUsos - usosCount, 0);
  const pct = Math.min(Math.round((usosCount / capUsos) * 100), 100);
  const turco = (c.usos || []).filter((u) => u.servicio === 'Turco').length;
  const jacuzzi = (c.usos || []).filter((u) => u.servicio === 'Jacuzzi').length;
  return { ...c, capUsos, usosCount, restantes, pct, turco, jacuzzi, costoUso: Math.round((c.precio || 0) / capUsos) };
}

/** Lee los cilindros crudos (sin derivar), sembrando la primera vez. */
function readCylinders() {
  return readSeeded(GAS_KEY, buildSeedGas);
}

/** @returns {Promise<Array>} cilindros CON métricas derivadas */
export async function listCylinders() {
  return readCylinders().map(computeCylinder);
}

/** Registra la compra de un cilindro nuevo (queda "en uso", sin usos). */
export async function createPurchase({ destino, compra, precio, capLb }) {
  const cyl = { id: newId('gas'), destino, compra, precio, capLb, usos: [], finalizado: false };
  const next = [cyl, ...readCylinders()];
  save(GAS_KEY, next);
  return next.map(computeCylinder);
}

/** Agrega un uso a un cilindro. */
export async function addUsage(cylId, usage) {
  const next = readCylinders().map((c) =>
    c.id === cylId ? { ...c, usos: [...(c.usos || []), { id: newId('u'), ...usage }] } : c,
  );
  save(GAS_KEY, next);
  return next.map(computeCylinder);
}

/** Edita un uso existente de un cilindro. */
export async function updateUsage(cylId, usoId, patch) {
  const next = readCylinders().map((c) =>
    c.id !== cylId ? c : { ...c, usos: (c.usos || []).map((u) => (u.id === usoId ? { ...u, ...patch } : u)) },
  );
  save(GAS_KEY, next);
  return next.map(computeCylinder);
}

/** Elimina un uso de un cilindro. */
export async function deleteUsage(cylId, usoId) {
  const next = readCylinders().map((c) =>
    c.id !== cylId ? c : { ...c, usos: (c.usos || []).filter((u) => u.id !== usoId) },
  );
  save(GAS_KEY, next);
  return next.map(computeCylinder);
}

/** Marca un cilindro como finalizado (fija la fecha y el total de usos). */
export async function finalizeCylinder(cylId, { fechaFin, usosFinal, obsFin }) {
  const next = readCylinders().map((c) =>
    c.id === cylId ? { ...c, finalizado: true, fechaFin, usosFinal, obsFin } : c,
  );
  save(GAS_KEY, next);
  return next.map(computeCylinder);
}
