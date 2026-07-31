/*
  FinanceSummaryModal — Resumen de caja del mes, abierto desde el KPI
  "Ingresos del mes" del Inicio.

  Decisión del cliente: el KPI de ingresos YA NO redirige a Finanzas; abre este
  modal con la foto rápida del mes, SIEMPRE del libro mayor (mismo origen que
  Finanzas). Muestra tres cifras que el cliente pidió ver de un vistazo:
    - Ingresos por MEMBRESÍAS (con cuántas se cobraron este mes).
    - Ingresos SIN contar membresías (ventas, inscripciones, otros).
    - Total de ingresos del mes hasta ahora.

  Solo cuenta entradas CONFIRMADAS (los pendientes no suman), igual que Finanzas.
  Un botón discreto lleva a Finanzas para quien quiera el detalle completo.

  Recibe:
    - controller: useModal
    - summary: { membershipTotal, membershipCount, otherTotal, total }
    - monthLabel: "Julio 2026"
    - onOpenFinance: () => void   — navega a Finanzas (opcional)
*/

import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import { formatMoney } from '../../../lib/money';
import styles from './FinanceSummaryModal.module.css';

export default function FinanceSummaryModal({ controller, summary, monthLabel, onOpenFinance }) {
  const { membershipTotal, membershipCount, otherTotal, total } = summary;

  return (
    <Modal controller={controller} width={460}>
      <div className={styles.header}>
        <span className={styles.icon}>≈</span>
        <div className={styles.heading}>
          <span className={styles.title}>Ingresos del mes</span>
          <span className={styles.month}>{monthLabel} · caja recibida</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.total}>{formatMoney(total)}</span>
        <span className={styles.totalSub}>total recibido este mes</span>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <div className={styles.rowInfo}>
            <span className={styles.rowLabel}>Membresías</span>
            <span className={styles.rowSub}>
              {membershipCount} {membershipCount === 1 ? 'cobrada' : 'cobradas'}
            </span>
          </div>
          <span className={styles.rowValue}>{formatMoney(membershipTotal)}</span>
        </div>

        <div className={styles.row}>
          <div className={styles.rowInfo}>
            <span className={styles.rowLabel}>Otros ingresos</span>
            <span className={styles.rowSub}>ventas, inscripciones y demás</span>
          </div>
          <span className={styles.rowValue}>{formatMoney(otherTotal)}</span>
        </div>
      </div>

      {onOpenFinance && (
        <div className={styles.footer}>
          <Button variant="outline" onClick={onOpenFinance}>Ver Finanzas →</Button>
        </div>
      )}
    </Modal>
  );
}
