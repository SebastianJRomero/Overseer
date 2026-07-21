/*
  FinanceKpis — Fila de indicadores + widget de historial.

  Tres tarjetas clicables (Entradas / Salidas / Balance neto) que abren el
  modal de detalle, y un cuarto widget "Historial de finanzas" con un
  sparkline del neto de 6 meses que abre el modal del gráfico grande.

  Recibe:
    - entradas / salidas / balance: totales del mes (números)
    - movCount: nº de movimientos (para el delta)
    - history: [[mes, ing, egr], …] (para el sparkline)
    - onOpenKpi: (kind) => void   'entradas' | 'salidas' | 'balance'
    - onOpenHistory: () => void
*/

import { formatMoney, formatMoneyShort } from '../../../lib/money';
import Sparkline from './charts/Sparkline';
import styles from './FinanceKpis.module.css';

export default function FinanceKpis({ entradas, salidas, balance, movCount, history, onOpenKpi, onOpenHistory }) {
  const margin = entradas ? Math.round((balance / entradas) * 100) : 0;
  const net = history.map((h) => h[1] - h[2]);
  const netTotal = net.reduce((s, v) => s + v, 0);

  const cards = [
    { kind: 'entradas', label: 'Entradas del mes', value: formatMoney(entradas), delta: `${movCount} movimientos registrados`, icon: '↗', color: 'var(--ok)', bar: 'linear-gradient(90deg, var(--ok), transparent)' },
    { kind: 'salidas', label: 'Salidas del mes', value: formatMoney(salidas), delta: 'Egresos del mes', icon: '↘', color: 'var(--danger)', bar: 'linear-gradient(90deg, var(--danger), transparent)' },
    { kind: 'balance', label: 'Balance neto', value: formatMoney(balance), delta: `${margin}% de margen`, icon: '◆', color: balance >= 0 ? 'var(--ok)' : 'var(--danger)', bar: 'linear-gradient(90deg, var(--danger-strong), transparent)' },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((k) => (
        <button key={k.kind} type="button" className={styles.card} onClick={() => onOpenKpi(k.kind)}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>{k.label}</span>
            <span className={styles.cardIcon} style={{ color: k.color }}>{k.icon}</span>
          </div>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>{k.value}</span>
            <span className={styles.cardDelta}>{k.delta}</span>
          </div>
          <div className={styles.cardBar} style={{ background: k.bar }} />
        </button>
      ))}

      {/* Widget de historial (sparkline del neto) */}
      <button type="button" className={styles.histWidget} onClick={onOpenHistory} title="Ver desempeño mes a mes">
        <div className={styles.histTop}>
          <span className={styles.histLabel}>Historial de finanzas</span>
          <span className={styles.histIcon}>◔</span>
        </div>
        <div className={styles.histValue}>
          <span className={styles.histNet}>{(netTotal >= 0 ? '+' : '−') + formatMoneyShort(Math.abs(netTotal))}</span>
          <span className={styles.histSub}>neto · 6 meses</span>
        </div>
        <div className={styles.histChart}>
          <Sparkline values={net} />
        </div>
        <div className={styles.histFooter}>Ver desempeño mes a mes <span>→</span></div>
      </button>
    </div>
  );
}
