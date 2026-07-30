/*
  MemberWizard — Alta y renovación de membresía por pasos (modal 620px).

  Dos modos:
    - 'add':   una pregunta por pantalla (7 pasos) + resumen final.
    - 'renew': 2 pasos compactos (plan+fechas → pago+notas). El inicio
      llega preseteado con el FIN anterior (el nuevo periodo arranca donde
      terminó el anterior) y el valor con lo que pagó la última vez.

  Validación por paso (no se puede continuar hasta que el campo sea válido):
    nombre, cédula, teléfono, fechas, recibo y valor son OBLIGATORIOS;
    observaciones es opcional. Cédula, teléfono y valor son numéricos
    (el input solo admite dígitos). El botón "Continuar/Guardar" se ve
    deshabilitado y Enter no avanza mientras el paso no sea válido.

  Enter siempre avanza: los inputs lo manejan ellos mismos y un listener
  global cubre los pasos sin input (plan y resumen), igual que el prototipo.

  El componente se monta con `key` nueva en cada apertura (lo hace el
  módulo), así el estado inicial se calcula limpio sin efectos de reset.

  Recibe:
    - controller: useModal
    - mode: 'add' | 'renew'
    - member: miembro a renovar (solo renew)
    - plans: planes activos del catálogo (Ajustes → Planes) [{ nombre, duracionDias, precio }]
    - onSave: (datos) => void — el módulo decide si es create o renew
*/

import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import WizardStepText from './WizardStepText';
import WizardStepPlanDates from './WizardStepPlanDates';
import WizardStepPago from './WizardStepPago';
import WizardSummary from './WizardSummary';
import { todayDMY, isValidDMY } from '../../../lib/date';
import { computeFin, SPECIAL_PLAN } from '../../../lib/memberStatus';
import { parseMoney } from '../../../lib/money';
import { onlyDigits } from '../../../lib/format';
import styles from './MemberWizard.module.css';

/* Pasos de texto del alta (el 4º es el combinado de plan, ver render).
   El campo se llama `field` (no `key`) para no chocar con la key de React
   al hacer spread de estas props. `format` marca los campos numéricos. */
const ADD_STEPS = [
  { field: 'nombre', label: '¿Cómo se llama el miembro?', hint: 'Nombre y apellido', placeholder: 'Ej: Valeria Gómez' },
  { field: 'cedula', label: 'Número de cédula', hint: 'Solo números', placeholder: '1.085.333.621', format: 'cedula' },
  { field: 'telefono', label: 'Teléfono de contacto', hint: 'Solo números', placeholder: '315 665 79 32', format: 'phone' },
  { field: 'plan' }, // paso combinado plan + fechas
  { field: 'recibo', label: 'Número de recibo', hint: 'Comprobante de pago', placeholder: 'RC-0000', mono: true },
  { field: 'valor', label: 'Valor pagado', hint: 'Monto del pago', placeholder: '$ 0', format: 'money' },
  { field: 'obs', label: 'Observaciones', hint: 'Opcional — puedes dejarlo vacío', placeholder: 'Notas sobre el miembro…' },
];

/* Campos obligatorios (obs queda fuera: es opcional). */
const REQUIRED = ['nombre', 'cedula', 'telefono', 'plan', 'recibo', 'valor'];

/** ¿El campo indicado tiene un valor aceptable en `data`? */
function fieldValid(field, data) {
  switch (field) {
    case 'nombre': return data.nombre.trim().length > 0;
    case 'cedula': return onlyDigits(data.cedula).length > 0;
    case 'telefono': return onlyDigits(data.telefono).length > 0;
    // El plan "Especial" no tiene fin: solo se exige un inicio válido.
    case 'plan': return isValidDMY(data.inicio) && (data.tipo === SPECIAL_PLAN || isValidDMY(data.fin));
    case 'recibo': return String(data.recibo || '').trim().length > 0;
    case 'valor': return parseMoney(data.valor) > 0;
    default: return true;
  }
}

/** Plan por defecto del catálogo: el preferido si existe, si no el primero. */
function pickDefaultPlan(plans, preferName) {
  if (!plans || plans.length === 0) return null;
  return plans.find((p) => p.nombre === preferName) || plans[0];
}

/** Datos iniciales según el modo (renew presetea con el miembro anterior). */
function initialData(mode, member, plans) {
  const hoy = todayDMY();
  if (mode === 'renew') {
    const inicio = isValidDMY(member?.fin) ? member.fin : hoy;
    // Conserva el plan y el valor anteriores (el cliente pidió precargar lo que
    // pagó); elegir un plan en el paso los actualiza al precio del catálogo.
    const plan = plans?.find((p) => p.nombre === member?.tipo);
    const tipo = member?.tipo || '1 mes';
    return {
      tipo, inicio, fin: computeFin(tipo, inicio, plan?.duracionDias),
      valor: member?.valor ?? null, recibo: '', obs: member?.obs || '',
    };
  }
  // Alta: arranca en el plan por defecto del catálogo con su precio precargado.
  const plan = pickDefaultPlan(plans, '1 mes');
  const tipo = plan?.nombre || '1 mes';
  return {
    nombre: '', cedula: '', telefono: '',
    tipo, inicio: hoy, fin: computeFin(tipo, hoy, plan?.duracionDias),
    recibo: '', valor: plan ? plan.precio : '', obs: '',
  };
}

export default function MemberWizard({ controller, mode, member, plans, onSave }) {
  const isRenew = mode === 'renew';
  const totalSteps = isRenew ? 2 : ADD_STEPS.length;
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => initialData(mode, member, plans));

  const patch = (p) => setData((d) => ({ ...d, ...p }));
  const isSummary = !isRenew && step >= ADD_STEPS.length;
  const isLast = isRenew ? step === 1 : isSummary;
  const currentField = !isRenew && !isSummary ? ADD_STEPS[step].field : null;

  /* ¿Se puede salir del paso actual? (bloquea Continuar/Enter si no). */
  const stepValid = (() => {
    if (isRenew) {
      return step === 0
        ? fieldValid('plan', data)
        : fieldValid('recibo', data) && fieldValid('valor', data);
    }
    if (isSummary) return REQUIRED.every((f) => fieldValid(f, data));
    return fieldValid(currentField, data);
  })();

  const save = () => {
    if (!stepValid) return;
    const valor = parseMoney(data.valor); // texto/número → número limpio
    onSave(isRenew
      ? { tipo: data.tipo, inicio: data.inicio, fin: data.fin, valor, recibo: data.recibo, obs: data.obs }
      : { ...data, valor });
  };

  const next = () => {
    if (!stepValid) return;         // no avanza si el paso es inválido
    if (isLast) save();
    else setStep(step + 1);
  };

  /* Enter global para pasos SIN input (plan, resumen): los inputs ya
     manejan su propio Enter y aquí se ignoran para no avanzar doble. */
  useEffect(() => {
    if (!controller.isOpen || controller.isClosing) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* A qué paso vuelve cada campo del resumen (los 3 del plan van juntos). */
  const jumpToField = (field) => {
    const planIdx = ADD_STEPS.findIndex((s) => s.field === 'plan');
    const idx = ['tipo', 'inicio', 'fin'].includes(field)
      ? planIdx
      : ADD_STEPS.findIndex((s) => s.field === field);
    setStep(idx);
  };

  const pct = isRenew
    ? (step === 0 ? 50 : 100)
    : Math.round((Math.min(step, totalSteps) / totalSteps) * 100);

  const current = !isRenew && !isSummary ? ADD_STEPS[step] : null;

  return (
    <Modal controller={controller} width={620} overflowVisible>
      {/* Cabecera: paso + título + cerrar */}
      <div className={styles.header}>
        <span className={styles.stepText}>
          {isSummary ? 'RESUMEN' : `PASO ${step + 1} DE ${totalSteps}`}
        </span>
        <span className={styles.wizTitle}>
          {isRenew ? `Renovación · ${member?.nombre ?? ''}` : 'Nuevo miembro'}
        </span>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      {/* Barra de progreso */}
      <div className={styles.progress}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      {/* Paso actual */}
      {isRenew && step === 0 && (
        <WizardStepPlanDates data={data} onPatch={patch} plans={plans} />
      )}
      {isRenew && step === 1 && (
        <WizardStepPago data={data} onPatch={patch} onNext={next} />
      )}
      {current && (current.field === 'plan' ? (
        <WizardStepPlanDates data={data} onPatch={patch} plans={plans} />
      ) : (
        <WizardStepText
          {...current}
          value={data[current.field]}
          onChange={(v) => patch({ [current.field]: v })}
          onNext={next}
          invalid={!stepValid && REQUIRED.includes(current.field)}
        />
      ))}
      {isSummary && <WizardSummary data={data} onEditField={jumpToField} />}

      {/* Pie: atrás · hint de Enter · continuar/guardar */}
      <div className={styles.footer}>
        {step > 0 && (
          <button type="button" className={styles.backBtn} onClick={() => setStep(step - 1)}>
            ← Atrás
          </button>
        )}
        <span className={styles.enterHint}>
          <kbd className={styles.kbd}>↵ Enter</kbd>
          {isLast ? 'para guardar' : 'para continuar'}
        </span>
        <button
          type="button"
          className={styles.nextBtn}
          style={!stepValid ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          onClick={next}
        >
          {isLast ? (isRenew ? 'Guardar renovación' : 'Guardar miembro') : 'Continuar →'}
        </button>
      </div>
    </Modal>
  );
}
