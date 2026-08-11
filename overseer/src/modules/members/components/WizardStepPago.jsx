/*
  WizardStepPago — Paso 2 de la RENOVACIÓN: pago y notas.

  El valor llega precargado con lo que pagó la vez anterior (regla del
  prototipo: "ajústalo si cambió"); el recibo siempre es nuevo y las
  observaciones vienen precargadas por si hay que actualizarlas.

  Recibe:
    - data: { valor (número|null), recibo, obs }
    - onPatch: (patch) => void
    - onNext: Enter en los inputs avanza (aquí: guardar)
*/

import Field from '../../../components/Field/Field';
import MoneyInput from '../../../components/MoneyInput/MoneyInput';
import styles from './MemberWizard.module.css';

export default function WizardStepPago({ data, onPatch, onNext }) {
  return (
    <div className={styles.stepBody}>
      <div className={styles.stepHeading}>
        <span className={styles.stepTitle}>Pago y notas</span>
        <span className={styles.stepHint}>Valor anterior precargado — ajústalo si cambió.</span>
      </div>

      <div className={styles.dateGrid}>
        <Field label="Valor pagado">
          <MoneyInput value={data.valor} onChange={(valor) => onPatch({ valor })} onEnter={onNext} />
        </Field>
        <Field label="N° Recibo nuevo">
          <input
            className={styles.boxInput}
            value={data.recibo}
            onChange={(e) => onPatch({ recibo: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') onNext(); }}
            placeholder="RC-0000"
          />
        </Field>
      </div>

      <Field label="Observaciones" hint="(opcional)">
        <textarea
          className={styles.boxTextarea}
          value={data.obs}
          onChange={(e) => onPatch({ obs: e.target.value })}
          placeholder="Notas sobre el miembro…"
          rows={3}
        />
      </Field>
    </div>
  );
}
