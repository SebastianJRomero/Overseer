/*
  EventModal — Crear / editar un evento (modal de 440px).

  Título, hora (TimePicker) y tipo (SegmentedOptions con los 4 tipos). Al
  editar aparece "Eliminar". Guardar se deshabilita sin título (misma regla
  del prototipo). Usa overflowVisible para que el selector de hora sobresalga.

  El modal se remonta con `key` en cada apertura (lo hace el módulo), así el
  estado inicial se toma limpio de `initial` sin efectos de reset.

  Recibe:
    - controller: useModal
    - initial: { dateKey, id, title, time, type } — id null = evento nuevo
    - onSave: (dateKey, { id, title, time, type }) => void
    - onDelete: (dateKey, id) => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import TimePicker from '../../../components/TimePicker/TimePicker';
import { DAY_NAMES, MONTH_NAMES } from '../../../lib/date';
import { EVENT_TYPES, EVENT_TYPE_OPTIONS } from '../eventTypes';
import styles from './EventModal.module.css';

/* "2026-07-05" → "lunes 5 de julio" (para la cabecera del modal). */
function dateLabel(dateKey) {
  const [Y, M, D] = dateKey.split('-').map(Number);
  const d = new Date(Y, M - 1, D);
  return `${DAY_NAMES[d.getDay()].toLowerCase()} ${D} de ${MONTH_NAMES[M - 1].toLowerCase()}`;
}

/* Opciones del tipo para SegmentedOptions (cada una con su color). */
const TYPE_OPTIONS = EVENT_TYPE_OPTIONS.map((t) => ({
  value: t, label: EVENT_TYPES[t].label, color: EVENT_TYPES[t].color, bg: EVENT_TYPES[t].bg,
}));

export default function EventModal({ controller, initial, onSave, onDelete }) {
  const [title, setTitle] = useState(initial.title || '');
  const [time, setTime] = useState(initial.time || '');
  const [type, setType] = useState(initial.type || 'Reserva');

  const isEdit = initial.id != null;
  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    // Sin hora elegida guardamos 00:00 (el prototipo hace lo mismo).
    onSave(initial.dateKey, { id: initial.id ?? null, title: title.trim(), time: time || '00:00', type });
  };

  return (
    <Modal controller={controller} width={440} overflowVisible>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar evento' : 'Nuevo evento'}</span>
          <span className={styles.date}>{dateLabel(initial.dateKey)}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Título">
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            placeholder="Reserva, clase o tarea…"
            autoFocus
          />
        </Field>

        <div className={styles.grid}>
          <Field label="Hora">
            <TimePicker value={time} onChange={setTime} />
          </Field>
          <Field label="Tipo">
            <SegmentedOptions options={TYPE_OPTIONS} value={type} onChange={setType} />
          </Field>
        </div>
      </div>

      <div className={styles.footer}>
        {isEdit && (
          <button type="button" className={styles.delete} onClick={() => onDelete(initial.dateKey, initial.id)}>
            Eliminar
          </button>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button
            type="button"
            className={styles.save}
            style={!canSave ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={save}
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
