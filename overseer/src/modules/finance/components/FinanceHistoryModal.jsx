/*
  FinanceHistoryModal — Historial mes a mes (gráfico grande + métricas).

  Muestra el LineChart de entradas vs salidas de 6 meses y 4 métricas
  (promedios, mejor mes por neto, balance acumulado). Tema azulado, fiel al
  prototipo.

  Recibe:
    - controller: useModal
    - history: [[mes, ingresos, egresos], …]
*/

import Modal from '../../../components/Modal/Modal';
import LineChart from './charts/LineChart';
import { formatMoney, formatMoneyShort } from '../../../lib/money';
import styles from './FinanceHistoryModal.module.css';

export default function FinanceHistoryModal({ controller, history }) {
  if (!history.length) return null;

  const income = history.map((h) => h[1]);
  const expense = history.map((h) => h[2]);
  const avgInc = Math.round(income.reduce((s, v) => s + v, 0) / history.length);
  const avgExp = Math.round(expense.reduce((s, v) => s + v, 0) / history.length);
  const best = history.reduce((b, h) => (h[1] - h[2] > b[1] - b[2] ? h : b));
  const netTotal = history.reduce((s, h) => s + (h[1] - h[2]), 0);

  const stats = [
    { label: 'Promedio entradas', value: formatMoney(avgInc), sub: 'por mes', color: '#6fb8ff' },
    { label: 'Promedio salidas', value: formatMoney(avgExp), sub: 'por mes', color: '#f0a878' },
    { label: 'Mejor mes', value: best[0], sub: 'neto ' + formatMoneyShort(best[1] - best[2]), color: '#eaf2fb' },
    { label: 'Balance acumulado', value: (netTotal >= 0 ? '+' : '−') + formatMoneyShort(Math.abs(netTotal)), sub: '6 meses', color: netTotal >= 0 ? '#6fb8ff' : '#f0a878' },
  ];

  return (
    <Modal controller={controller} width={1180}>
      <div className={styles.header}>
        <span className={styles.icon}>◔</span>
        <div className={styles.heading}>
          <span className={styles.title}>Historial de finanzas</span>
          <span className={styles.subtitle}>Desempeño mes a mes · últimos 6 meses</span>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={styles.legendLine} style={{ background: '#6fb8ff' }} />Entradas</span>
          <span className={styles.legendItem}><span className={styles.legendLine} style={{ background: '#f0a878' }} />Salidas</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <div className={styles.chartCard}>
          <LineChart history={history} />
        </div>
        <div className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
