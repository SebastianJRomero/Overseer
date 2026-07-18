/*
  CalendarToolbar — Cabecera del módulo: título + navegación por mes.

  Reutiliza MonthNav (‹ / etiqueta / › / Hoy). El botón "Hoy" se enciende
  solo si el mes visible es el real (lo decide el módulo con isCurrentMonth).

  Recibe:
    - monthLabel: "Julio 2026"
    - isCurrentMonth / onPrev / onNext / onToday
*/

import MonthNav from '../../../components/MonthNav/MonthNav';
import styles from './CalendarToolbar.module.css';

export default function CalendarToolbar({ monthLabel, isCurrentMonth, onPrev, onNext, onToday }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.heading}>
        <span className={styles.title}>Calendario</span>
        <span className={styles.subtitle}>Haz clic en un día para agregar una reserva o tarea.</span>
      </div>
      <MonthNav
        label={monthLabel}
        isToday={isCurrentMonth}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
    </div>
  );
}
