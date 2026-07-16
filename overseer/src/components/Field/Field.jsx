/*
  Field — Campo de formulario: label uppercase + control debajo.

  Estandariza el patrón de TODOS los formularios del prototipo:
  un label pequeño en mayúsculas con tracking (10.5px, gris) y debajo el
  control (input, textarea, date-picker, lo que sea → children).

  Recibe:
    - label: texto del label
    - hint: aclaración opcional en minúsculas junto al label
      (p. ej. "(auto)" o "· nombre del cliente, detalle…")
    - children: el control
*/

import styles from './Field.module.css';

export default function Field({ label, hint, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {hint && <span className={styles.hint}> {hint}</span>}
      </span>
      {children}
    </label>
  );
}
