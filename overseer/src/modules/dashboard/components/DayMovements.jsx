/*
  DayMovements — Widget "Movimientos del día" (columna ancha del Inicio).

  Es la ventana de Finanzas puesta en el Inicio: MISMO origen de datos
  (movementsService) y MISMA fila (MovementRow de Finanzas), para que un
  movimiento se vea idéntico en los dos sitios. Lo propio de aquí es el
  cursor por DÍA (MonthNav) y los dos botones de registro.

  Recibe (de las props comunes del registro de widgets):
    - day / dayLabel / isToday, prevDay / nextDay / goToday
    - movements, entradas, salidas
    - onSettle: (id) => void
    - onNewMovement: (kind) => void   'entrada' | 'salida'
*/

import MonthNav from '../../../components/MonthNav/MonthNav';
import EmptyState from '../../../components/EmptyState/EmptyState';
import MovementRow from '../../finance/components/MovementRow';
import AnimatedNumber from '../../../components/AnimatedNumber/AnimatedNumber';
import { formatMoney } from '../../../lib/money';
import styles from './DayMovements.module.css';

/** Formatea el valor intermedio del tween como dinero (redondeado). */
const asMoney = (n) => formatMoney(Math.round(n));

export default function DayMovements({
  dayLabel, isToday, prevDay, nextDay, goToday,
  movements, entradas, salidas, onSettle, onNewMovement,
}) {
  return (
    <div className={styles.panel}>
      {/* Cabecera: título + resumen del día en dos píldoras */}
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Movimientos del día</span>
          <span className={styles.subtitle}>{dayLabel} · {movements.length} movimientos</span>
        </div>
        <span className={`${styles.pill} ${styles.pillIn}`}>↗ <AnimatedNumber value={entradas} format={asMoney} /></span>
        <span className={`${styles.pill} ${styles.pillOut}`}>↘ <AnimatedNumber value={salidas} format={asMoney} /></span>
      </div>

      {/* Toolbar: navegación por día + registrar entrada/salida */}
      <div className={styles.toolbar}>
        <MonthNav
          label={dayLabel}
          isToday={isToday}
          onPrev={prevDay}
          onNext={nextDay}
          onToday={goToday}
        />
        <div className={styles.actions}>
          <button type="button" className={`${styles.regBtn} ${styles.regEntrada}`} onClick={() => onNewMovement('entrada')}>
            ↗ Registrar entrada
          </button>
          <button type="button" className={`${styles.regBtn} ${styles.regSalida}`} onClick={() => onNewMovement('salida')}>
            ↘ Registrar salida
          </button>
        </div>
      </div>

      {movements.length > 0 ? (
        <div className={styles.list}>
          {movements.map((mv) => (
            <MovementRow key={mv.id} mv={mv} onConfirm={onSettle} />
          ))}
        </div>
      ) : (
        <EmptyState>Sin movimientos este día. Registra una entrada o salida.</EmptyState>
      )}
    </div>
  );
}
