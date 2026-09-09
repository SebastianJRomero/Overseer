/*
  MovementList — Panel "Detalle de movimientos" del mes.

  Cabecera con el conteo y los botones Registrar entrada / salida, y la lista
  de filas (MovementRow). Vacío improbable (siempre hay generados), pero se
  contempla.

  Recibe:
    - monthLabel: "Julio 2026"
    - movements: movimientos de dominio del mes
    - onConfirm: (id) => void
    - onNewEntrada / onNewSalida: abrir el modal de movimiento
*/

import { useState } from 'react';
import MovementRow from './MovementRow';
import styles from './MovementList.module.css';

// Filtro por medio de pago (en memoria, no toca el backend).
const PAY_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'nequi', label: 'Nequi' },
];

export default function MovementList({ monthLabel, movements, onConfirm, onNewEntrada, onNewSalida }) {
  const [payFilter, setPayFilter] = useState('todos');
  const visible = payFilter === 'todos'
    ? movements
    : movements.filter((mv) => (mv.medio_pago === 'nequi' ? 'nequi' : 'efectivo') === payFilter);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Detalle de movimientos</span>
          <span className={styles.subtitle}>{monthLabel} · {visible.length} movimientos</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={`${styles.regBtn} ${styles.regEntrada}`} onClick={onNewEntrada}>
            ↗ Registrar entrada
          </button>
          <button type="button" className={`${styles.regBtn} ${styles.regSalida}`} onClick={onNewSalida}>
            ↘ Registrar salida
          </button>
        </div>
      </div>

      {/* Filtro Efectivo/Nequi: quién pagó por cada medio (Fase 1). */}
      <div className={styles.filterRow}>
        {PAY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={payFilter === f.id ? `${styles.filterBtn} ${styles.filterActive}` : styles.filterBtn}
            onClick={() => setPayFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {visible.map((mv) => (
          <MovementRow key={mv.id} mv={mv} onConfirm={onConfirm} />
        ))}
      </div>
    </div>
  );
}
