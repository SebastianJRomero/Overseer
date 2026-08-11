/*
  WizardSummary — Resumen final del alta: revisar antes de guardar.

  Lista label→valor; cada fila es clicable y devuelve al paso donde se
  corrige ese dato (onEditField). Los campos vacíos se muestran en gris
  con "—" (u "Sin observaciones") para que se note qué faltó.

  Recibe:
    - data: los datos acumulados del wizard
    - onEditField: (campo) => void
*/

import { formatMoney, parseMoney } from '../../../lib/money';
import { formatShortDate } from '../../../lib/date';
import styles from './MemberWizard.module.css';

/* Orden y etiquetas del resumen (mismo orden del prototipo). */
const ROWS = [
  ['nombre', 'Nombre'],
  ['cedula', 'Cédula'],
  ['telefono', 'Teléfono'],
  ['tipo', 'Membresía'],
  ['inicio', 'Fecha inicio'],
  ['fin', 'Fecha fin'],
  ['recibo', 'N° Recibo'],
  ['valor', 'Valor pagado'],
  ['obs', 'Observaciones'],
];

export default function WizardSummary({ data, onEditField }) {
  const display = (key) => {
    const val = data[key];
    if (key === 'valor' && val) return formatMoney(parseMoney(val));
    // Fechas del resumen en formato legible ("8 Ago 2026").
    if ((key === 'inicio' || key === 'fin') && val) return formatShortDate(val);
    if (val) return val;
    return key === 'obs' ? 'Sin observaciones' : '—';
  };

  return (
    <div className={styles.stepBody}>
      <div className={styles.stepHeading}>
        <span className={styles.stepTitle}>Confirma los datos</span>
        <span className={styles.stepHint}>Revisa antes de guardar. Toca un dato para corregirlo.</span>
      </div>

      <div className={styles.summary}>
        {ROWS.map(([key, label]) => (
          <button key={key} type="button" className={styles.summaryRow} onClick={() => onEditField(key)}>
            <span className={styles.summaryLabel}>{label}</span>
            <span className={data[key] ? styles.summaryValue : styles.summaryEmpty}>
              {display(key)}
            </span>
            <span className={styles.summaryEdit}>✎</span>
          </button>
        ))}
      </div>
    </div>
  );
}
