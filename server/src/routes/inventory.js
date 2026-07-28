/*
  routes/inventory.js — Endpoints del inventario (productos, equipos, gas).

  Espejan services/inventoryService.js. Tres sub-inventarios:

  Productos:
    GET    /inventory/products             → Product[]  (listProducts)
    POST   /inventory/products             → Product[]  (createProduct)
    PATCH  /inventory/products/:id         → Product[]  (updateProduct)
    DELETE /inventory/products/:id         → Product[]  (deleteProduct)
    POST   /inventory/products/apply-sale  → Product[]  (applySale; body {items})

  Equipos:
    GET    /inventory/equipment            → Equipment[] (listEquipment)
    POST   /inventory/equipment            → Equipment[] (createEquipment)
    PATCH  /inventory/equipment/:id        → Equipment[] (updateEquipment)

  Gas (con métricas derivadas en computeCylinder):
    GET    /inventory/gas                        → Cylinder[] (listCylinders)
    POST   /inventory/gas                        → Cylinder[] (createPurchase)
    POST   /inventory/gas/:id/usage              → Cylinder[] (addUsage)
    PATCH  /inventory/gas/:id/usage/:usoId       → Cylinder[] (updateUsage)
    DELETE /inventory/gas/:id/usage/:usoId       → Cylinder[] (deleteUsage)
    POST   /inventory/gas/:id/finalize           → Cylinder[] (finalizeCylinder)

  Las métricas del gas y el estado del producto se DERIVAN (nunca se guardan).
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

/* ══════════════════ PRODUCTOS ══════════════════ */

const PRODUCT_COLS = 'id, nombre, categoria, stock, venta, compra';
const listProducts = () => db.prepare(`SELECT ${PRODUCT_COLS} FROM products ORDER BY ord ASC`).all();

router.get('/products', (req, res) => res.json(listProducts()));

router.post('/products', (req, res) => {
  const d = req.body || {};
  const record = {
    id: newId('pr'), nombre: d.nombre ?? '', categoria: d.categoria ?? '',
    stock: Number(d.stock) || 0, venta: Number(d.venta) || 0, compra: Number(d.compra) || 0,
  };
  db.prepare(`INSERT INTO products (id, ord, nombre, categoria, stock, venta, compra)
    VALUES (@id, @ord, @nombre, @categoria, @stock, @venta, @compra)`)
    .run({ ...record, ord: nextOrd('products', 'end') });
  res.status(201).json(listProducts());
});

router.patch('/products/:id', (req, res) => {
  const patch = req.body || {};
  const allowed = ['nombre', 'categoria', 'stock', 'venta', 'compra'];
  const keys = Object.keys(patch).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE products SET ${setSql} WHERE id = @id`).run({ ...patch, id: req.params.id });
  }
  res.json(listProducts());
});

router.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json(listProducts());
});

/**
 * Descuenta stock por NOMBRE de producto (los artículos escritos a mano no
 * coinciden y no afectan nada). El stock nunca baja de 0. Es el mismo criterio
 * que applySale del mock: coordinado desde el hook al registrar una venta.
 */
router.post('/products/apply-sale', (req, res) => {
  const items = (req.body && req.body.items) || {};
  const upd = db.prepare('UPDATE products SET stock = MAX(0, stock - @qty) WHERE nombre = @nombre');
  const tx = db.transaction((entries) => {
    for (const [nombre, qty] of entries) upd.run({ nombre, qty: Number(qty) || 0 });
  });
  tx(Object.entries(items));
  res.json(listProducts());
});

/* ══════════════════ EQUIPOS ══════════════════ */

const EQUIP_COLS = 'id, nombre, cantidad, estado, revision, obs';
const listEquipment = () => db.prepare(`SELECT ${EQUIP_COLS} FROM equipment ORDER BY ord ASC`).all();

router.get('/equipment', (req, res) => res.json(listEquipment()));

router.post('/equipment', (req, res) => {
  const d = req.body || {};
  const record = {
    id: newId('eq'), nombre: d.nombre ?? '', cantidad: Number(d.cantidad) || 0,
    estado: d.estado ?? '', revision: d.revision ?? '', obs: d.obs ?? '',
  };
  db.prepare(`INSERT INTO equipment (id, ord, nombre, cantidad, estado, revision, obs)
    VALUES (@id, @ord, @nombre, @cantidad, @estado, @revision, @obs)`)
    .run({ ...record, ord: nextOrd('equipment', 'end') });
  res.status(201).json(listEquipment());
});

router.patch('/equipment/:id', (req, res) => {
  const patch = req.body || {};
  const allowed = ['nombre', 'cantidad', 'estado', 'revision', 'obs'];
  const keys = Object.keys(patch).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE equipment SET ${setSql} WHERE id = @id`).run({ ...patch, id: req.params.id });
  }
  res.json(listEquipment());
});

/* ══════════════════ GAS (zona húmeda) ══════════════════ */

/**
 * Enriquece un cilindro con sus métricas derivadas (idéntico al mock):
 *   capUsos, usosCount, restantes, pct, turco, jacuzzi, costoUso.
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

const CYL_COLS = 'id, destino, compra, precio, capLb, finalizado, fechaFin, usosFinal, obsFin';
const USO_COLS = 'id, fecha, hora, servicio, obs';

/** Lee un cilindro crudo (con sus usos), o null si no existe. */
function readCylinderRaw(id) {
  const row = db.prepare(`SELECT ${CYL_COLS} FROM gas_cylinders WHERE id = ?`).get(id);
  if (!row) return null;
  const usos = db.prepare(`SELECT ${USO_COLS} FROM gas_usos WHERE cylId = ? ORDER BY ord ASC`).all(id);
  return { ...row, finalizado: !!row.finalizado, usos };
}

/** Lista completa de cilindros CON métricas derivadas (orden de la UI). */
function listCylinders() {
  const ids = db.prepare('SELECT id FROM gas_cylinders ORDER BY ord ASC').all().map((r) => r.id);
  return ids.map((id) => computeCylinder(readCylinderRaw(id)));
}

router.get('/gas', (req, res) => res.json(listCylinders()));

router.post('/gas', (req, res) => {
  const { destino, compra, precio, capLb } = req.body || {};
  const record = { id: newId('gas'), destino, compra, precio: Number(precio) || 0, capLb: Number(capLb) || 0 };
  db.prepare(`INSERT INTO gas_cylinders (id, ord, destino, compra, precio, capLb, finalizado, fechaFin, usosFinal, obsFin)
    VALUES (@id, @ord, @destino, @compra, @precio, @capLb, 0, NULL, NULL, NULL)`)
    .run({ ...record, ord: nextOrd('gas_cylinders', 'top') });
  res.status(201).json(listCylinders());
});

router.post('/gas/:id/usage', (req, res) => {
  const u = req.body || {};
  const record = {
    id: newId('u'), cylId: req.params.id,
    fecha: u.fecha ?? '', hora: u.hora ?? '', servicio: u.servicio ?? '', obs: u.obs ?? '',
  };
  db.prepare(`INSERT INTO gas_usos (id, ord, cylId, fecha, hora, servicio, obs)
    VALUES (@id, @ord, @cylId, @fecha, @hora, @servicio, @obs)`)
    .run({ ...record, ord: nextOrd('gas_usos', 'end') });
  res.status(201).json(listCylinders());
});

router.patch('/gas/:id/usage/:usoId', (req, res) => {
  const patch = req.body || {};
  const allowed = ['fecha', 'hora', 'servicio', 'obs'];
  const keys = Object.keys(patch).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE gas_usos SET ${setSql} WHERE id = @usoId AND cylId = @cylId`)
      .run({ ...patch, usoId: req.params.usoId, cylId: req.params.id });
  }
  res.json(listCylinders());
});

router.delete('/gas/:id/usage/:usoId', (req, res) => {
  db.prepare('DELETE FROM gas_usos WHERE id = ? AND cylId = ?').run(req.params.usoId, req.params.id);
  res.json(listCylinders());
});

router.post('/gas/:id/finalize', (req, res) => {
  const { fechaFin, usosFinal, obsFin } = req.body || {};
  db.prepare(`UPDATE gas_cylinders SET finalizado = 1, fechaFin = @fechaFin, usosFinal = @usosFinal, obsFin = @obsFin WHERE id = @id`)
    .run({ fechaFin: fechaFin ?? null, usosFinal: usosFinal ?? null, obsFin: obsFin ?? null, id: req.params.id });
  res.json(listCylinders());
});

export default router;
