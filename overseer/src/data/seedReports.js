/*
  data/seedReports.js — Indicadores del negocio (mock).

  Módulo opcional "Reportes". Son cifras de ejemplo FIJAS (como el prototipo):
  el reporte real —agregando miembros, finanzas e inventario de verdad— es
  trabajo del backend (ver "Limitaciones conocidas" en PROGRESO.md). Aquí solo
  se muestran KPIs, ingresos mensuales y distribución de planes de demostración.
*/

/* KPIs con su variación respecto al periodo anterior. */
export const REPORT_KPIS = [
  { label: 'Ingresos del mes', value: '$ 8.4M', delta: '+12%', up: true },
  { label: 'Nuevos miembros', value: '38', delta: '+6', up: true },
  { label: 'Retención', value: '87%', delta: '+3%', up: true },
  { label: 'Clases impartidas', value: '164', delta: '−4', up: false },
];

/* Ingresos mensuales (en millones). El último mes es el actual (resaltado). */
export const INCOME_MONTHS = [
  { mes: 'Feb', valor: 6.1 },
  { mes: 'Mar', valor: 6.8 },
  { mes: 'Abr', valor: 7.2 },
  { mes: 'May', valor: 7.9 },
  { mes: 'Jun', valor: 7.4 },
  { mes: 'Jul', valor: 8.4 },
];

/* Distribución de miembros por plan (%). Paleta categórica decorativa. */
export const PLAN_DISTRIBUTION = [
  { nombre: '1 mes', pct: 52, color: '#7fb1f5' },
  { nombre: '3 meses', pct: 24, color: '#7ee2a0' },
  { nombre: 'Quincena', pct: 14, color: '#c6a0f5' },
  { nombre: 'Anual', pct: 10, color: '#ffb35c' },
];
