/*
  TimePicker — Campo de hora con selector emergente (hecho a mano, sin
  librerías). Segundo popover más repetido del prototipo (evento de
  calendario y uso de cilindro de gas).

  El valor viaja en 24h ("HH:mm") pero se ELIGE y se MUESTRA en 12h con
  AM/PM, como en el prototipo: tres columnas (horas 1-12, minutos de 5 en 5,
  AM/PM). Elegir hora o minuto mantiene el popover abierto; elegir AM/PM lo
  cierra (es el último dato que falta).

  Recibe:
    - value: "HH:mm" (24h) o '' (sin hora)
    - onChange: (hhmm) => void
    - align: 'left' | 'right' — a qué borde se pega el popover
*/

import usePopover from '../../hooks/usePopover';
import { pad2 } from '../../lib/date';
import styles from './TimePicker.module.css';

/* Descompone "HH:mm" (24h) en la vista 12h. Sin valor → placeholder. */
function parse12(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || '');
  if (!m) return { has: false, h12: 12, min: 0, ampm: 'AM' };
  const h24 = +m[1];
  const min = +m[2];
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { has: true, h12, min, ampm };
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,…,55

export default function TimePicker({ value, onChange, align = 'left' }) {
  const popover = usePopover();
  const { has, h12, min, ampm } = parse12(value);

  // Reconstruye "HH:mm" (24h) a partir de la selección 12h.
  const setTime = (nh12, nmin, nampm) => {
    let H = nh12 % 12;
    if (nampm === 'PM') H += 12;
    onChange(`${pad2(H)}:${pad2(nmin)}`);
  };

  const label = has ? `${pad2(h12)}:${pad2(min)} ${ampm}` : '--:--';

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={popover.isActive ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        onClick={popover.toggle}
      >
        <span className={has ? styles.value : styles.placeholder}>{label}</span>
        <span className={styles.icon}>◷</span>
      </button>

      {popover.isOpen && (
        <div
          className={styles.popover}
          style={{
            [align === 'right' ? 'right' : 'left']: 0,
            animation: popover.isClosing
              ? 'pickerOut .15s ease forwards'
              : 'cardIn .18s cubic-bezier(.2,.9,.3,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Horas */}
          <div className={styles.column}>
            {HOURS.map((hr) => (
              <button
                key={hr}
                type="button"
                className={has && hr === h12 ? `${styles.cell} ${styles.cellOn}` : styles.cell}
                onClick={() => setTime(hr, has ? min : 0, has ? ampm : 'AM')}
              >
                {hr}
              </button>
            ))}
          </div>
          {/* Minutos */}
          <div className={styles.column}>
            {MINUTES.map((mn) => (
              <button
                key={mn}
                type="button"
                className={has && mn === min ? `${styles.cell} ${styles.cellOn}` : styles.cell}
                onClick={() => setTime(has ? h12 : 12, mn, has ? ampm : 'AM')}
              >
                {pad2(mn)}
              </button>
            ))}
          </div>
          {/* AM / PM — cierra al elegir (es el último dato) */}
          <div className={styles.ampmColumn}>
            {['AM', 'PM'].map((ap) => (
              <button
                key={ap}
                type="button"
                className={has && ap === ampm ? `${styles.seg} ${styles.segOn}` : styles.seg}
                onClick={() => { setTime(has ? h12 : 12, has ? min : 0, ap); popover.close(); }}
              >
                {ap}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
