/*
  data/seedFinance.js — Datos fijos de Finanzas (mock).

  Complementan a los movimientos: el desglose de "Origen de las entradas",
  los gastos fijos próximos y el historial de meses anteriores para el
  gráfico. Son datos de ejemplo del prototipo; con API real vendrían de
  agregados del backend.
*/

/* Fuentes de ingreso distintas de las membresías (para el desglose %). */
export const INCOME_SOURCES = [
  { label: 'Ventas de inventario', value: 340000, color: 'var(--info)' },
  { label: 'Inscripciones nuevas', value: 90000, color: '#ff9d85' },
  { label: 'Clases especiales', value: 120000, color: '#c79dff' },
];

/* Membresías cobradas en el mes (para calcular el ingreso por membresías). */
export const MEMBERSHIP_PRICES = {
  Quincena: 12000, '1 mes': 70000, '2 meses': 130000, '3 meses': 180000, Anual: 620000, Especial: 0,
};
export const PAID_THIS_MONTH = [
  { nombre: 'Valeria Gómez', tipo: '1 mes' },
  { nombre: 'Camila Torres', tipo: '1 mes' },
  { nombre: 'Luisa Fernanda', tipo: '1 mes' },
  { nombre: 'Mateo Cárdenas', tipo: 'Quincena' },
  { nombre: 'Andrés Restrepo', tipo: '3 meses' },
  { nombre: 'Sofía Ramírez', tipo: '2 meses' },
  { nombre: 'Daniel Ospina', tipo: '1 mes' },
];

/* Gastos fijos próximos (se muestran junto a los pendientes del usuario). */
export const FIXED_UPCOMING = [
  { label: 'Nómina (2ª quincena)', due: '30 Jul', value: 2800000, urgent: true },
  { label: 'Arriendo agosto', due: '01 Ago', value: 1800000, urgent: false },
  { label: 'Renovación software', due: '08 Ago', value: 120000, urgent: false },
  { label: 'Pedido de suplementos', due: '12 Ago', value: 450000, urgent: false },
];

/* Historial de los 5 meses anteriores [mes, ingresos, egresos]. El mes
   actual se añade en tiempo real con los totales calculados. */
export const HISTORY_MONTHS = [
  ['Feb', 5800000, 6100000],
  ['Mar', 6300000, 6000000],
  ['Abr', 6900000, 6250000],
  ['May', 7100000, 6400000],
  ['Jun', 7400000, 6250000],
];
