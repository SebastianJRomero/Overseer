/*
  UpcomingExpenses — "Gastos próximos": pendientes/recurrentes + fijos.

  Recibe:
    - rows: [{ label, due, value, urgent }] de getUpcomingExpenses
*/

import Badge from '../../../components/Badge/Badge';
import { formatMoney } from '../../../lib/money';
import styles from './Sidebar.module.css';

export default function UpcomingExpenses({ rows }) {
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Gastos próximos</span>
        <span className={styles.cardTotal}>{formatMoney(total)}</span>
      </div>
      <div className={styles.list}>
        {rows.map((r, i) => (
          <div key={`${r.label}-${i}`} className={styles.expenseRow}>
            <span className={styles.dot} style={{ background: r.urgent ? 'var(--danger)' : 'var(--warn)' }} />
            <span className={styles.expenseLabel}>{r.label}</span>
            <Badge
              color={r.urgent ? 'var(--danger)' : 'var(--warn)'}
              bg={r.urgent ? 'var(--danger-bg)' : 'var(--warn-bg)'}
            >
              {r.due}
            </Badge>
            <span className={styles.expenseValue}>{formatMoney(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
