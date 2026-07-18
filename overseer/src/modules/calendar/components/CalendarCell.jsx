/*
  CalendarCell — Una celda del calendario (un día o un hueco).

  Un día muestra: etiqueta "festivo" (si aplica), número en píldora (con
  gradiente de acento si es hoy) y hasta 3 eventos (dot + hora + título),
  más "+n más" si hay ocultos. Clic en la celda → nuevo evento ese día;
  clic en un evento → editarlo (sin propagar al día).

  Recibe:
    - cell: objeto de calendarCells.buildCalendarCells
    - onDayClick: (dateKey) => void
    - onEventClick: (dateKey, evento) => void
*/

import { getEventType } from '../eventTypes';
import styles from './CalendarGrid.module.css';

export default function CalendarCell({ cell, onDayClick, onEventClick }) {
  if (cell.blank) return <div className={styles.blank} />;

  // Clases del fondo: hoy manda sobre finde/festivo.
  const cls = [
    styles.cell,
    (cell.weekend || cell.holiday) && styles.special,
    cell.isToday && styles.today,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} onClick={() => onDayClick(cell.key)}>
      <div className={styles.cellHeader}>
        {cell.holiday && <span className={styles.holiday}>festivo</span>}
        <span className={cell.isToday ? `${styles.dayNum} ${styles.dayNumToday}` : styles.dayNum}>
          {cell.day}
        </span>
      </div>

      <div className={styles.events}>
        {cell.events.map((ev) => {
          const t = getEventType(ev.type);
          return (
            <button
              key={ev.id}
              type="button"
              className={styles.event}
              style={{ background: t.bg }}
              title={ev.title}
              onClick={(e) => { e.stopPropagation(); onEventClick(cell.key, ev); }}
            >
              <span className={styles.eventDot} style={{ background: t.color }} />
              {ev.time && <span className={styles.eventTime} style={{ color: t.color }}>{ev.time}</span>}
              <span className={styles.eventTitle}>{ev.title}</span>
            </button>
          );
        })}
        {cell.extra > 0 && <span className={styles.more}>+{cell.extra} más</span>}
      </div>
    </div>
  );
}
