/*
  CalendarGrid — Grilla mensual: cabecera de días + celdas.

  Cabecera lunes-first (Lun…Dom) y el cuerpo de 7 columnas. Las celdas las
  arma calendarCells (pura); aquí solo se recorren y se delega cada una a
  CalendarCell.

  Recibe:
    - cells: array de buildCalendarCells
    - onDayClick / onEventClick: se pasan a cada celda
*/

import CalendarCell from './CalendarCell';
import styles from './CalendarGrid.module.css';

/* Cabecera de la semana empezando en lunes (como se leen en Colombia). */
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarGrid({ cells, onDayClick, onEventClick }) {
  return (
    <div className={styles.grid}>
      <div className={styles.weekHeader}>
        {WEEKDAYS.map((w) => (
          <div key={w} className={styles.weekday}>{w}</div>
        ))}
      </div>
      <div className={styles.body}>
        {cells.map((cell) => (
          <CalendarCell
            key={cell.key}
            cell={cell}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
