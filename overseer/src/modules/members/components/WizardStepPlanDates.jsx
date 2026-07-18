/*
  WizardStepPlanDates — Paso combinado: plan + fecha inicio + fecha fin.

  Lo comparten el alta (paso 4) y la renovación (paso 1). Reglas:
    - elegir plan recalcula la fecha fin (computeFin) sobre el inicio actual,
    - cambiar el inicio también recalcula el fin,
    - el fin siempre se puede ajustar a mano después (por eso "(auto)").

  Recibe:
    - data: { tipo, inicio, fin } (parte del estado del wizard)
    - onPatch: (patch) => void — el wizard fusiona el cambio
    - planOptions: planes que ofrece el gimnasio
*/

import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import { computeFin } from '../../../lib/memberStatus';
import styles from './MemberWizard.module.css';

export default function WizardStepPlanDates({ data, onPatch, planOptions }) {
  const pickPlan = (tipo) => onPatch({ tipo, fin: computeFin(tipo, data.inicio) });
  const pickInicio = (inicio) => onPatch({ inicio, fin: computeFin(data.tipo, inicio) || data.fin });

  return (
    <div className={styles.stepBody}>
      <div className={styles.stepHeading}>
        <span className={styles.stepTitle}>Plan y fechas</span>
        <span className={styles.stepHint}>La fecha fin se calcula según el plan — puedes ajustar ambas.</span>
      </div>

      <SegmentedOptions
        options={planOptions.map((p) => ({ value: p, label: p }))}
        value={data.tipo}
        onChange={pickPlan}
      />

      <div className={styles.dateGrid}>
        <Field label="Fecha inicio">
          <DatePicker value={data.inicio} onChange={pickInicio} />
        </Field>
        <Field label="Fecha fin" hint="(auto)">
          <DatePicker value={data.fin} onChange={(fin) => onPatch({ fin })} align="right" />
        </Field>
      </div>
    </div>
  );
}
