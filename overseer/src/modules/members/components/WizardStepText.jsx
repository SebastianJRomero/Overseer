/*
  WizardStepText — Paso de pregunta con UN campo de texto grande.

  El wizard de alta es "una pregunta por pantalla": título grande, hint
  gris y un input subrayado de 20px que toma el foco solo. Enter avanza.

  Formato en vivo (prop `format`): cédula, teléfono y valor son campos
  NUMÉRICOS. Se guarda siempre el valor crudo (solo dígitos) pero se MUESTRA
  formateado mientras se escribe (1.085.333.621 · 315 665 79 32 · $ 70.000).

  Recibe:
    - label / hint / placeholder: textos del paso
    - mono: true para fuente monoespaciada (cifras/códigos)
    - format: 'cedula' | 'phone' | 'money' | undefined
    - value / onChange: valor CRUDO del campo (string de dígitos si es numérico)
    - onNext: avanzar de paso (Enter)
    - invalid: marca el subrayado en rojo si el paso no es válido aún
*/

import { formatCedula, formatPhone, onlyDigits } from '../../../lib/format';
import { formatThousands } from '../../../lib/money';
import styles from './MemberWizard.module.css';

/* Cómo se PINTA cada campo numérico a partir de su valor crudo. */
const DISPLAY = {
  cedula: (v) => formatCedula(v),
  phone: (v) => formatPhone(v),
  money: (v) => (v ? '$ ' + formatThousands(Number(onlyDigits(v))) : ''),
};

export default function WizardStepText({ label, hint, placeholder, mono, format, value, onChange, onNext, invalid }) {
  // Numéricos: se muestran formateados; texto libre: tal cual.
  const display = format ? DISPLAY[format](value) : value;

  const handleChange = (e) => {
    // En campos numéricos guardamos solo los dígitos (el formato es cosmético).
    onChange(format ? onlyDigits(e.target.value) : e.target.value);
  };

  const inputClass = [
    styles.bigInput,
    (mono || format) && styles.bigInputMono,
    invalid && styles.bigInputInvalid,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.stepBody}>
      <div className={styles.stepHeading}>
        <span className={styles.stepTitle}>{label}</span>
        <span className={styles.stepHint}>{hint}</span>
      </div>
      <input
        /* key por label: al cambiar de paso se remonta y re-enfoca solo */
        key={label}
        className={inputClass}
        value={display}
        onChange={handleChange}
        onKeyDown={(e) => { if (e.key === 'Enter') onNext(); }}
        placeholder={placeholder}
        inputMode={format ? 'numeric' : undefined}
        autoFocus
      />
    </div>
  );
}
