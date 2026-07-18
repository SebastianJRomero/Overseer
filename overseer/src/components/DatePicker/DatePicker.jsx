/*
  DatePicker — Campo de fecha con calendario emergente (hecho a mano,
  sin librerías: ARQUITECTURA §7).

  Es EL popover más repetido del prototipo (fechas de miembro, wizard,
  movimientos, equipos, cilindros…), por eso vive en components/.

  Comportamiento del prototipo:
    - clic en el campo → abre/cierra el calendario (borde acento al abrir),
    - navegación por meses ‹ ›, semana lunes-first,
    - el día seleccionado se pinta con el gradiente de acento; el día de
      HOY con un tinte suave,
    - elegir un día dispara onChange("dd/mm/aaaa") y cierra animado.

  Recibe:
    - value: "dd/mm/aaaa" o '' (vacío)
    - onChange: (dmy) => void
    - align: 'left' | 'right' — a qué borde del campo se pega el popover
    - placeholder: texto cuando no hay fecha
*/

import { useState } from 'react';
import usePopover from '../../hooks/usePopover';
import {
  MONTH_NAMES, WEEKDAY_LETTERS,
  parseDMY, formatDMY, todayDMY, pad2, mondayFirstLead, daysInMonth,
} from '../../lib/date';
import styles from './DatePicker.module.css';

/** Mes que debe mostrar el calendario al abrir: el de la fecha elegida, o el actual. */
function initialCursor(value) {
  const d = parseDMY(value) || new Date();
  return { y: d.getFullYear(), m: d.getMonth() };
}

export default function DatePicker({ value, onChange, align = 'left', placeholder = 'Seleccionar fecha' }) {
  const popover = usePopover();
  const [cursor, setCursor] = useState(() => initialCursor(value));

  const openCalendar = () => {
    // Reposicionar el cursor cada vez que se abre (la fecha pudo cambiar).
    if (!popover.isOpen) setCursor(initialCursor(value));
    popover.toggle();
  };

  const shiftMonth = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const pickDay = (day) => {
    onChange(formatDMY(new Date(cursor.y, cursor.m, day)));
    popover.close();
  };

  /* Celdas del mes: huecos iniciales (para alinear el día 1 con su columna
     lunes-first) + los días reales. */
  const lead = mondayFirstLead(cursor.y, cursor.m);
  const total = daysInMonth(cursor.y, cursor.m);
  const hoy = todayDMY();

  return (
    <div className={styles.wrap}>
      {/* Campo disparador */}
      <button
        type="button"
        className={popover.isActive ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        onClick={openCalendar}
      >
        <span className={value ? styles.value : styles.placeholder}>{value || placeholder}</span>
        <span className={styles.icon}>▤</span>
      </button>

      {/* Calendario emergente */}
      {popover.isOpen && (
        <div
          className={styles.popover}
          style={{
            [align === 'right' ? 'right' : 'left']: 0,
            animation: popover.isClosing
              ? 'pickerOut .15s ease forwards'
              : 'cardIn .2s cubic-bezier(.2,.9,.3,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <button type="button" className={styles.nav} onClick={() => shiftMonth(-1)}>‹</button>
            <span className={styles.month}>{MONTH_NAMES[cursor.m]} {cursor.y}</span>
            <button type="button" className={styles.nav} onClick={() => shiftMonth(1)}>›</button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAY_LETTERS.map((w) => <span key={w} className={styles.weekday}>{w}</span>)}
          </div>

          <div className={styles.days}>
            {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: total }, (_, i) => {
              const day = i + 1;
              const dmy = `${pad2(day)}/${pad2(cursor.m + 1)}/${cursor.y}`;
              const cls = [
                styles.day,
                dmy === value && styles.daySelected,
                dmy === hoy && dmy !== value && styles.dayToday,
              ].filter(Boolean).join(' ');
              return (
                <button key={dmy} type="button" className={cls} onClick={() => pickDay(day)}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
