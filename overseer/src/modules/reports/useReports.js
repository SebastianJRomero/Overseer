/*
  modules/reports/useReports.js — Carga los datos del módulo Reportes.

  Solo lectura (reportsService.getReport). Devuelve KPIs, ingresos mensuales y
  distribución de planes.
*/

import { useEffect, useState } from 'react';
import * as reportsService from '../../services/reportsService';

export default function useReports() {
  const [report, setReport] = useState({ kpis: [], incomeMonths: [], planDistribution: [] });

  useEffect(() => { reportsService.getReport().then(setReport); }, []);

  return report;
}
