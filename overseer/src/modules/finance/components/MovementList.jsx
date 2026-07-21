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

import MovementRow from './MovementRow';
import styles from './MovementList.module.css';

export default function MovementList({ monthLabel, movements, onConfirm, onNewEntrada, onNewSalida }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Detalle de movimientos</span>
          <span className={styles.subtitle}>{monthLabel} · {movements.length} movimientos</span>
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

      <div className={styles.list}>
        {movements.map((mv) => (
          <MovementRow key={mv.id} mv={mv} onConfirm={onConfirm} />
        ))}
      </div>
    </div>
  );
}
