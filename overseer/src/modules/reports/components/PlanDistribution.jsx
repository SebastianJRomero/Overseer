/*
  PlanDistribution — Distribución de miembros por plan (panel de Reportes).

  Una barra de progreso por plan, con su porcentaje.

  Recibe:
    - rows: [{ nombre, pct, color }]
*/

import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import styles from './PlanDistribution.module.css';

export default function PlanDistribution({ rows }) {
  return (
    <div className={styles.panel}>
      <span className={styles.title}>Distribución de planes</span>
      <div className={styles.list}>
        {rows.map((p) => (
          <div key={p.nombre} className={styles.row}>
            <div className={styles.head}>
              <span className={styles.nombre}>{p.nombre}</span>
              <span className={styles.pct}>{p.pct}%</span>
            </div>
            <ProgressBar value={p.pct} color={p.color} height={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
