/*
  PlanModal — Ajustes → Planes → Nuevo plan (modal 460px).

  Nombre, duración (días) y precio (MoneyInput). Guardar se bloquea sin
  nombre. El plan nace activo.

  Recibe:
    - controller: useModal
    - onSave: ({ nombre, duracionDias, precio }) => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import MoneyInput from '../../../components/MoneyInput/MoneyInput';
import Icon from '../../../components/Icon/Icon';
import styles from './SettingsModal.module.css';

export default function PlanModal({ controller, onSave }) {
  const [nombre, setNombre] = useState('');
  const [dur, setDur] = useState('');
  const [precio, setPrecio] = useState(null);

  const canSave = nombre.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), duracionDias: Number(dur) || 0, precio: precio || 0 });
  };

  return (
    <Modal controller={controller} width={460}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="finance" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>Nuevo plan</span>
          <span className={styles.subtitle}>Agrega una membresía al catálogo</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre del plan">
          <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') save(); }} placeholder="Ej: Semestral" autoFocus />
        </Field>
        <div className={styles.grid}>
          <Field label="Duración (días)">
            <input className={styles.input} value={dur} onChange={(e) => setDur(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="30" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
          <Field label="Precio">
            <MoneyInput value={precio} onChange={setPrecio} />
          </Field>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>Crear plan</button>
        </div>
      </div>
    </Modal>
  );
}
