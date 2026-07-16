/*
  Toggle — Interruptor on/off (switch de 40×24).

  Encendido usa el gradiente de acento; apagado, gris de borde. Se usa en
  Ajustes (módulos, notificaciones, respaldos).

  Recibe:
    - checked: boolean
    - onChange: (nuevoValor) => void
    - label: texto accesible (aria-label) — el texto visible lo pone quien lo usa
*/

import styles from './Toggle.module.css';

export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? `${styles.track} ${styles.on}` : styles.track}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
