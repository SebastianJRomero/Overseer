/*
  services/reportsService.js — Reportes del negocio (mock hoy → API mañana).

  Solo lectura: devuelve las cifras de ejemplo (KPIs, ingresos mensuales,
  distribución de planes). Cuando exista backend, aquí se calcularán de los
  datos reales; la UI no cambia.

  Contrato:
    getReport() → Promise<{ kpis, incomeMonths, planDistribution }>
*/

import { REPORT_KPIS, INCOME_MONTHS, PLAN_DISTRIBUTION } from '../data/seedReports';

/** @returns {Promise<{kpis, incomeMonths, planDistribution}>} */
export async function getReport() {
  return {
    kpis: REPORT_KPIS,
    incomeMonths: INCOME_MONTHS,
    planDistribution: PLAN_DISTRIBUTION,
  };
}
