/*
  GasHistory — Panel "Historial de cilindros" (zona húmeda).

  Lista todos los cilindros (en uso + finalizados) con costo, usos, costo por
  uso y estado. Clic en una fila abre su historial de usos. El botón de la
  cabecera registra una compra nueva.

  Recibe:
    - cylinders: cilindros enriquecidos
    - onView: (cyl) => void
    - onNewPurchase: () => void
*/

import { formatMoney } from '../../../lib/money';
import { getDestinoStyle } from '../inventoryStyles';
import panel from './InventoryPanel.module.css';
import styles from './GasTab.module.css';

export default function GasHistory({ cylinders, onView, onNewPurchase }) {
  return (
    <div className={panel.panel}>
      <div className={panel.header}>
        <span className={panel.title}>Historial de cilindros</span>
        <button type="button" className={panel.addBtn} onClick={onNewPurchase}>＋ Registrar compra</button>
      </div>

      <div className={`${panel.headRow} ${styles.histGrid}`}>
        <span>Destino / compra</span>
        <span style={{ textAlign: 'right' }}>Costo</span>
        <span style={{ textAlign: 'right' }}>Usos</span>
        <span style={{ textAlign: 'right' }}>Costo / uso</span>
        <span style={{ textAlign: 'right' }}>Estado</span>
      </div>

      {cylinders.map((c) => {
        const dest = getDestinoStyle(c.destino);
        return (
          <button
            key={c.id}
            type="button"
            className={`${panel.row} ${styles.histGrid} ${panel.rowClickable}`}
            onClick={() => onView(c)}
            title="Ver historial de uso"
          >
            <span className={panel.nameCell}>
              <span className={panel.catBadge} style={{ color: dest.color, background: dest.bg }}>{dest.label}</span>
              <span className={styles.histCompra}>{c.compra}</span>
            </span>
            <span className={styles.histNum} style={{ color: 'var(--text-mid)' }}>{formatMoney(c.precio)}</span>
            <span className={styles.histNum} style={{ color: 'var(--text-muted)' }}>{c.usosCount}</span>
            <span className={styles.histNum} style={{ color: 'var(--ok)' }}>{formatMoney(c.costoUso)}</span>
            <span className={styles.histEstadoCell}>
              <span
                className={styles.histEstado}
                style={c.finalizado
                  ? { color: 'var(--text-muted)', background: 'var(--border-1)' }
                  : { color: 'var(--ok)', background: 'var(--ok-bg)' }}
              >
                {c.finalizado ? 'Finalizado' : 'En uso'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
