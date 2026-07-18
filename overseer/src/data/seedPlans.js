/*
  data/seedPlans.js — Catálogo de planes de membresía (mock).

  Los 5 planes del prototipo (Ajustes → Planes y precios). `duracionDias`
  es informativo para la pantalla de Ajustes; la fecha de fin real la
  calcula computeFin (lib/memberStatus.js), que usa meses CALENDARIO para
  los planes de meses — no una cuenta de días.

  "Anual" existe en el catálogo pero arranca inactivo (igual que en el
  prototipo): los planes inactivos no se ofrecen al crear/renovar.
*/

export const SEED_PLANS = [
  { id: 'p-quincena', nombre: 'Quincena', duracionDias: 15, precio: 12000, activo: true },
  { id: 'p-1mes', nombre: '1 mes', duracionDias: 30, precio: 70000, activo: true },
  { id: 'p-2meses', nombre: '2 meses', duracionDias: 60, precio: 130000, activo: true },
  { id: 'p-3meses', nombre: '3 meses', duracionDias: 90, precio: 180000, activo: true },
  { id: 'p-anual', nombre: 'Anual', duracionDias: 365, precio: 620000, activo: false },
];
