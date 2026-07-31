/*
  InventoryKpis — Fila de 3 mini-KPIs del sub-inventario activo.

  A diferencia de los KpiCard grandes del Inicio/Finanzas, aquí el prototipo
  usa tarjetas pequeñas (label + cifra en mono coloreada). Cada sub-tab pasa
  sus propias 3 métricas.

  Recibe:
    - items: [{ label, value, color }]
*/

import AnimatedValue from '../../../components/AnimatedNumber/AnimatedValue';
import styles from './InventoryKpis.module.css';

export default function InventoryKpis({ items }) {
  return (
    <div className={styles.grid}>
      {items.map((k) => (
        <div key={k.label} className={styles.card}>
          <span className={styles.label}>{k.label}</span>
          <span className={styles.value} style={{ color: k.color }}><AnimatedValue value={k.value} /></span>
        </div>
      ))}
    </div>
  );
}
