/*
  UpcomingEvents — Widget "Próximos eventos" (columna derecha).

  Los 4 eventos más cercanos del calendario (eventsService.getUpcoming, que
  ya los filtra y ordena). Todo el panel es clicable: lleva al módulo
  Calendario. Cada fila muestra una franja del color del tipo, el asunto
  arriba y "día MES · hora" abajo, con el tipo en badge a la derecha.

  Recibe:
    - upcoming: eventos { id, title, time, type, dateKey }
    - onOpenCalendar: () => void
*/

import Badge from '../../../components/Badge/Badge';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Icon from '../../../components/Icon/Icon';
import { MONTH_ABBR_UP, pad2 } from '../../../lib/date';
import { getEventType } from '../../calendar/eventTypes';
import styles from './SideWidget.module.css';

/* "2026-07-22" → "22 JUL" (el dateKey siempre viene de dateKey(), es seguro). */
function shortDay(dateKey) {
  const [, M, D] = dateKey.split('-').map(Number);
  return `${pad2(D)} ${MONTH_ABBR_UP[M - 1]}`;
}

export default function UpcomingEvents({ upcoming, onOpenCalendar }) {
  return (
    <div className={`${styles.panel} ${styles.panelLink}`} onClick={onOpenCalendar}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="calendar" /></span>
        <span className={styles.title}>Próximos eventos</span>
        <span className={styles.link}>Ver →</span>
      </div>

      {upcoming.length > 0 ? (
        <div className={styles.list}>
          {upcoming.map((e) => {
            const t = getEventType(e.type);
            return (
              <div key={e.id} className={styles.eventRow}>
                <span className={styles.stripe} style={{ background: t.color }} />
                <span className={styles.info}>
                  <span className={styles.name}>{e.title}</span>
                  {/* Los eventos que agenda Finanzas (Cobro/Pago) no llevan
                      hora: en ese caso no se pinta el separador colgando. */}
                  <span className={styles.meta}>{shortDay(e.dateKey)}{e.time ? ` · ${e.time}` : ''}</span>
                </span>
                <Badge color={t.color} bg={t.bg}>{t.label}</Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState>Sin eventos próximos. Abre el calendario para agregar.</EmptyState>
      )}
    </div>
  );
}
