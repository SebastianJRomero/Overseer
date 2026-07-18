/*
  CalendarLegend — Leyenda de tipos de evento + finde/festivo.

  Fila de puntos de color: los 4 tipos que el usuario crea y, tras un
  separador, el color lavanda de fin de semana / festivo.
*/

import { EVENT_TYPES, EVENT_TYPE_OPTIONS } from '../eventTypes';
import styles from './CalendarLegend.module.css';

export default function CalendarLegend() {
  return (
    <div className={styles.legend}>
      {EVENT_TYPE_OPTIONS.map((t) => (
        <span key={t} className={styles.item}>
          <span className={styles.dot} style={{ background: EVENT_TYPES[t].color }} />
          {EVENT_TYPES[t].label}
        </span>
      ))}
      <span className={styles.divider} />
      <span className={styles.item}>
        <span className={styles.dot} style={{ background: 'var(--holiday)' }} />
        Fin de semana / festivo
      </span>
    </div>
  );
}
