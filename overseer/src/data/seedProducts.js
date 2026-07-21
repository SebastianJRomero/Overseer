/*
  data/seedProducts.js — Productos en venta (mock).

  Semilla compartida: la usa el CATÁLOGO del modal de movimientos (Finanzas,
  fase 4) para calcular el monto de una venta, y la reutilizará el módulo de
  Inventario (fase 6) con su tabla y edición.

  Precios en número limpio: `venta` (precio al público) y `compra` (costo,
  uso interno). El estado (En stock / Bajo / Agotado) se DERIVA del stock en
  el módulo de inventario, no se guarda.
*/

export const SEED_PRODUCTS = [
  { id: 'pr-agua', nombre: 'Agua 600ml', categoria: 'Bebidas', stock: 40, venta: 3000, compra: 1800 },
  { id: 'pr-hidratante', nombre: 'Bebida hidratante', categoria: 'Bebidas', stock: 12, venta: 5000, compra: 3000 },
  { id: 'pr-whey', nombre: 'Proteína Whey 1kg', categoria: 'Suplementos', stock: 3, venta: 95000, compra: 65000 },
  { id: 'pr-creatina', nombre: 'Creatina 300g', categoria: 'Suplementos', stock: 7, venta: 60000, compra: 40000 },
  { id: 'pr-preentreno', nombre: 'Pre-entreno', categoria: 'Suplementos', stock: 0, venta: 75000, compra: 50000 },
  { id: 'pr-guantes', nombre: 'Guantes de entrenamiento', categoria: 'Accesorios', stock: 5, venta: 35000, compra: 22000 },
  { id: 'pr-toallas', nombre: 'Toallas de gimnasio', categoria: 'Accesorios', stock: 18, venta: 18000, compra: 11000 },
  { id: 'pr-shaker', nombre: 'Shaker', categoria: 'Accesorios', stock: 22, venta: 15000, compra: 9000 },
];
