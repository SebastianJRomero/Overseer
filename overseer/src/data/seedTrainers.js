/*
  data/seedTrainers.js — Entrenadores / staff (mock).

  Módulo opcional "Entrenadores". `clientes`/`clases` son números; `activo`
  marca si está disponible. Las iniciales y el estado se derivan en el módulo.

  Entrenador: { id, nombre, esp, clientes, clases, activo }
*/

export const SEED_TRAINERS = [
  { id: 'tr-camila', nombre: 'Camila Rojas', esp: 'Spinning · Cardio', clientes: 34, clases: 3, activo: true },
  { id: 'tr-julian', nombre: 'Julián Mesa', esp: 'CrossFit · Funcional', clientes: 41, clases: 5, activo: true },
  { id: 'tr-daniela', nombre: 'Daniela Cruz', esp: 'Yoga · Movilidad', clientes: 22, clases: 2, activo: true },
  { id: 'tr-andrea', nombre: 'Andrea Pineda', esp: 'Zumba · Baile', clientes: 38, clases: 2, activo: true },
  { id: 'tr-marco', nombre: 'Marco Díaz', esp: 'Boxeo · Fuerza', clientes: 18, clases: 2, activo: false },
];
