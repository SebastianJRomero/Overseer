/*
  GeneralSection — Ajustes → Datos del gimnasio.

  Tarjeta del logotipo + rejilla de campos editables (nombre, contacto,
  horarios, moneda, zona). Cada campo guarda al escribir (setGymField).

  Recibe (de useSettings): gym, setGymField.
*/

import { GYM_FIELDS } from '../../../services/settingsService';
import styles from './GeneralSection.module.css';

export default function GeneralSection({ gym, setGymField }) {
  return (
    <div className={styles.wrap}>
      {/* Logotipo (el "Cambiar" es decorativo por ahora, como el prototipo) */}
      <div className={styles.logoCard}>
        <div className={styles.logoMark}><span>O</span></div>
        <div className={styles.logoInfo}>
          <span className={styles.logoTitle}>Logotipo</span>
          <span className={styles.logoDesc}>PNG o SVG · mínimo 256×256px</span>
        </div>
        <button type="button" className={styles.logoBtn}>Cambiar</button>
      </div>

      {/* Campos del gimnasio */}
      <div className={styles.grid}>
        {GYM_FIELDS.map((f) => (
          <label key={f.key} className={styles.field}>
            <span className={styles.fieldLabel}>{f.label}</span>
            <input
              className={styles.fieldInput}
              style={f.mono ? { fontFamily: 'var(--font-mono)' } : undefined}
              value={gym[f.key] ?? ''}
              onChange={(e) => setGymField(f.key, e.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
