/*
  DayEventsModal — Lista de eventos de un día (modal sencillo).

  Se abre al hacer clic en un día que YA tiene eventos: muestra todos los de
  ese día y permite abrir uno para editarlo o agregar uno nuevo. Un día SIN
  eventos abre directamente el modal de nuevo evento (no pasa por aquí).

  Recibe:
    - controller: useModal
    - dateKey: "aaaa-mm-dd" del día
    - events: Evento[] de ese día
    - onSelect: (evento) => void   abrir para editar
    - onAdd: () => void            crear uno nuevo ese día
*/

import Modal from '../../../components/Modal/Modal';
import { DAY_NAMES, MONTH_NAMES } from '../../../lib/date';
import { getEventType } from '../eventTypes';
import styles from './DayEventsModal.module.css';

/* "2026-07-05" → "lunes 5 de julio" (cabecera del modal). */
function dateLabel(dateKey) {
  const [Y, M, D] = dateKey.split('-').map(Number);
  const d = new Date(Y, M - 1, D);
  return `${DAY_NAMES[d.getDay()].toLowerCase()} ${D} de ${MONTH_NAMES[M - 1].toLowerCase()}`;
}

export default function DayEventsModal({ controller, dateKey, events, onSelect, onAdd }) {
  return (
    <Modal controller={controller} width={420}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Eventos del día</span>
          <span className={styles.date}>{dateLabel(dateKey)}</span>
        </div>
        <span className={styles.count}>{events.length}</span>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.list}>
        {events.map((ev) => {
          const t = getEventType(ev.type);
          return (
            <button
              key={ev.id}
              type="button"
              className={styles.row}
              /* Degradado sutil del color de la categoría → superficie, para
                 teñir el fondo con elegancia sin perder la estructura. */
              style={{ background: `linear-gradient(100deg, color-mix(in srgb, ${t.color} 16%, var(--surface-1)), var(--surface-1) 72%)` }}
              onClick={() => onSelect(ev)}
            >
              <span className={styles.stripe} style={{ background: t.color }} />
              {ev.time && <span className={styles.time}>{ev.time}</span>}
              <span className={styles.rowTitle}>{ev.title}</span>
              <span className={styles.badge} style={{ color: t.color, background: t.bg }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.add} onClick={onAdd}>＋ Agregar evento</button>
      </div>
    </Modal>
  );
}
