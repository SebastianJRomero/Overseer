/*
  ReportsModule — Contenedor del módulo Reportes (opcional, solo lectura).

  KPIs con variación (StatTiles con delta) + dos paneles: ingresos mensuales
  (barras) y distribución de planes. Los datos son de ejemplo (el reporte real
  con datos agregados llega con el backend — ver "Limitaciones conocidas").
*/

import useReports from './useReports';
import StatTiles from '../../components/StatTiles/StatTiles';
import IncomeBars from './components/IncomeBars';
import PlanDistribution from './components/PlanDistribution';
import styles from './reports.module.css';

export default function ReportsModule() {
  const { kpis, incomeMonths, planDistribution } = useReports();

  const tiles = kpis.map((k) => ({ label: k.label, value: k.value, delta: k.delta, deltaUp: k.up }));

  return (
    <div className={styles.module}>
      <div className={styles.heading}>
        <span className={styles.title}>Reportes</span>
        <span className={styles.subtitle}>Indicadores y análisis del negocio</span>
      </div>

      <StatTiles items={tiles} minWidth={190} />

      <div className={styles.panels}>
        <IncomeBars months={incomeMonths} />
        <PlanDistribution rows={planDistribution} />
      </div>
    </div>
  );
}
