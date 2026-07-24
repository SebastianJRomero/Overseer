/*
  PlansSection — Ajustes → Planes y precios.

  Catálogo de membresías: alta por modal, activar/ocultar (clic en el badge)
  y eliminar. Todo persiste vía plansService — el mismo catálogo que lee
  Miembros para ofrecer planes al crear/renovar (los ocultos no se ofrecen).

  Recibe (de useSettings): plans, createPlan, togglePlan, deletePlan.
*/

import useModal from '../../../hooks/useModal';
import { formatMoney } from '../../../lib/money';
import SettingsCard from './SettingsCard';
import PlanModal from './PlanModal';
import shared from './SettingsShared.module.css';
import styles from './PlansSection.module.css';

export default function PlansSection({ plans, createPlan, togglePlan, deletePlan }) {
  const modal = useModal();

  const save = async (datos) => {
    await createPlan(datos);
    modal.close();
  };

  const addBtn = (
    <button type="button" className={shared.addBtn} onClick={modal.open}>＋ Nuevo plan</button>
  );

  return (
    <>
      <SettingsCard title="Membresías" action={addBtn}>
        {plans.map((p) => (
          <div key={p.id} className={`${shared.row} ${shared.rowHover}`}>
            <div className={shared.rowInfo}>
              <span className={styles.name} style={{ color: p.activo ? 'var(--text-title)' : 'var(--text-soft)' }}>{p.nombre}</span>
              <span className={styles.dur}>{p.duracionDias} días</span>
            </div>
            <span className={styles.precio}>{formatMoney(p.precio)}</span>
            <button
              type="button"
              className={styles.stateBadge}
              style={p.activo
                ? { color: 'var(--ok)', background: 'var(--ok-bg)' }
                : { color: 'var(--text-soft)', background: 'var(--border-1)' }}
              onClick={() => togglePlan(p.id)}
              title="Clic para activar u ocultar"
            >
              {p.activo ? 'Activo' : 'Oculto'}
            </button>
            <button type="button" className={styles.delete} onClick={() => deletePlan(p.id)} title="Eliminar plan">✕</button>
          </div>
        ))}
      </SettingsCard>

      <PlanModal controller={modal} onSave={save} />
    </>
  );
}
