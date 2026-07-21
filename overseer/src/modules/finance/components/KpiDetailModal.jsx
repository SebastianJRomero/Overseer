/*
  KpiDetailModal — Detalle de un KPI (entradas / salidas / balance).

  Entradas y salidas → lista de sus movimientos (reutiliza MovementRow) con
  un pie de "Confirmado / Pendientes". Balance → desglose entradas − salidas
  con el margen y una nota sobre pendientes.

  Recibe:
    - controller: useModal
    - kind: 'entradas' | 'salidas' | 'balance' | null
    - monthData: { movements, entradas, salidas, balance }
    - monthLabel: "Julio 2026"
    - onConfirm: (id) => void
*/

import Modal from '../../../components/Modal/Modal';
import MovementRow from './MovementRow';
import { formatMoney } from '../../../lib/money';
import { getMovementMeta } from '../movementMeta';
import styles from './KpiDetailModal.module.css';

const TITLES = { entradas: 'Entradas del mes', salidas: 'Salidas del mes', balance: 'Balance neto' };
const ICONS = { entradas: '↗', salidas: '↘', balance: '◆' };

export default function KpiDetailModal({ controller, kind, monthData, monthLabel, onConfirm }) {
  if (!kind) return null;
  const { movements, entradas, salidas, balance } = monthData;
  const isBalance = kind === 'balance';
  const isSalidas = kind === 'salidas';

  const color = isSalidas ? 'var(--danger)' : (isBalance ? (balance >= 0 ? 'var(--ok)' : 'var(--danger)') : 'var(--ok)');
  const rows = movements.filter((mv) => (getMovementMeta(mv.tipo).sign > 0) === (kind === 'entradas'));
  const total = isSalidas ? salidas : (isBalance ? balance : entradas);
  const pendTotal = rows.filter((mv) => mv.pending).reduce((s, mv) => s + mv.monto, 0);

  return (
    <Modal controller={controller} width={640}>
      <div className={styles.header}>
        <span className={styles.icon} style={{ color }}>{ICONS[kind]}</span>
        <div className={styles.heading}>
          <span className={styles.title}>{TITLES[kind]}</span>
          <span className={styles.month}>{monthLabel}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.total} style={{ color }}>{formatMoney(total)}</span>
        <span className={styles.totalSub}>
          {isBalance ? 'Entradas menos salidas · no incluye pendientes' : `${rows.length} movimientos · incluye pendientes`}
        </span>
      </div>

      {isBalance ? (
        <div className={styles.balanceBody}>
          <div className={styles.balRow}>
            <span>Entradas confirmadas</span>
            <span className={styles.balPos}>+ {formatMoney(entradas)}</span>
          </div>
          <div className={styles.balRow}>
            <span>Salidas confirmadas</span>
            <span className={styles.balNeg}>− {formatMoney(salidas)}</span>
          </div>
          <div className={styles.balNet}>
            <div className={styles.balNetInfo}>
              <span className={styles.balNetTitle}>Balance neto</span>
              <span className={styles.balNetMargin}>{entradas ? Math.round((balance / entradas) * 100) : 0}% de margen</span>
            </div>
            <span className={styles.balNetValue} style={{ color }}>{formatMoney(balance)}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {rows.map((mv) => <MovementRow key={mv.id} mv={mv} onConfirm={onConfirm} />)}
          </div>
          <div className={styles.footer}>
            <div className={styles.footerCol}>
              <span className={styles.footerLabel}>Confirmado</span>
              <span className={styles.footerValue} style={{ color }}>{formatMoney(total)}</span>
            </div>
            {pendTotal > 0 && (
              <div className={`${styles.footerCol} ${styles.footerRight}`}>
                <span className={styles.footerLabel}>{isSalidas ? 'Salidas pendientes' : 'Entradas pendientes'}</span>
                <span className={styles.footerPend}>{formatMoney(pendTotal)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
