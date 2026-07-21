/*
  IncomeBreakdown — "Origen de las entradas": barras de % por fuente.

  Recibe:
    - rows: [{ label, value, color, pct }] de movementsService.getIncomeBreakdown
*/

import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import styles from './Sidebar.module.css';

export default function IncomeBreakdown({ rows }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Origen de las entradas</span>
      </div>
      <div className={styles.breakdown}>
        {rows.map((r) => (
          <div key={r.label} className={styles.breakdownRow}>
            <div className={styles.breakdownTop}>
              <span className={styles.swatch} style={{ background: r.color }} />
              <span className={styles.breakdownLabel}>{r.label}</span>
              <span className={styles.breakdownPct}>{r.pct}%</span>
            </div>
            <ProgressBar value={r.pct} color={r.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
