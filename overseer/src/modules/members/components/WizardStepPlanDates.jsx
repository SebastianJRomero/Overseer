/*
  WizardStepPlanDates — Paso combinado: plan + fecha inicio + fecha fin.

  Lo comparten el alta (paso 4) y la renovación (paso 1). Reglas:
    - elegir plan recalcula la fecha fin (computeFin) sobre el inicio actual y
      PRECARGA el valor con el precio del plan del catálogo,
    - cambiar el inicio también recalcula el fin,
    - el fin siempre se puede ajustar a mano después (por eso "(auto)").

  El catálogo de planes viene de Ajustes (plansService.listActivePlans, vía
  useActivePlans). A los planes activos se les añade "Especial" (tipo de
  membresía sin fin, que no vive en el catálogo). Si el catálogo aún no cargó,
  se cae a PLAN_OPTIONS (respaldo) para que el paso siga usable.

  Recibe:
    - data: { tipo, inicio, fin } (parte del estado del wizard)
    - onPatch: (patch) => void — el wizard fusiona el cambio
    - plans: planes activos del catálogo [{ nombre, duracionDias, precio }]
*/

import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import { formatShortDate } from '../../../lib/date';
import { computeFin, SPECIAL_PLAN, PLAN_OPTIONS } from '../../../lib/memberStatus';
import styles from './MemberWizard.module.css';

export default function WizardStepPlanDates({ data, onPatch, plans }) {
  // Catálogo a ofrecer: planes activos + "Especial". Si no cargó, respaldo.
  const catalog = plans && plans.length
    ? [...plans.map((p) => ({ nombre: p.nombre, precio: p.precio, duracionDias: p.duracionDias })), { nombre: SPECIAL_PLAN }]
    : PLAN_OPTIONS.map((nombre) => ({ nombre }));

  const findPlan = (nombre) => catalog.find((p) => p.nombre === nombre);

  const pickPlan = (nombre) => {
    const plan = findPlan(nombre);
    const patch = { tipo: nombre, fin: computeFin(nombre, data.inicio, plan?.duracionDias) };
    // Precio precargado: elegir un plan del catálogo trae su precio (el usuario
    // puede ajustarlo). "Especial" no tiene precio → no toca el valor.
    if (plan && plan.precio != null) patch.valor = plan.precio;
    onPatch(patch);
  };

  const pickInicio = (inicio) => {
    const plan = findPlan(data.tipo);
    onPatch({ inicio, fin: computeFin(data.tipo, inicio, plan?.duracionDias) || data.fin });
  };

  return (
    <div className={styles.stepBody}>
      <div className={styles.stepHeading}>
        <span className={styles.stepTitle}>Plan y fechas</span>
        <span className={styles.stepHint}>La fecha fin y el valor se cargan según el plan — puedes ajustarlos.</span>
      </div>

      <SegmentedOptions
        options={catalog.map((p) => ({ value: p.nombre, label: p.nombre }))}
        value={data.tipo}
        onChange={pickPlan}
      />

      <div className={styles.dateGrid}>
        <Field label="Fecha inicio">
          <div data-field="inicio">
            <DatePicker value={data.inicio} onChange={pickInicio} display={formatShortDate} />
          </div>
        </Field>
        <Field label="Fecha fin" hint="(auto)">
          <div data-field="fin">
            <DatePicker value={data.fin} onChange={(fin) => onPatch({ fin })} align="right" display={formatShortDate} />
          </div>
        </Field>
      </div>
    </div>
  );
}
