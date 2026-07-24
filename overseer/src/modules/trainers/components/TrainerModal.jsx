/*
  TrainerModal — Nuevo / editar entrenador (modal 480px).

  Nombre, especialidad, clientes/clases y estado (Disponible/Ausente). Guardar
  se bloquea sin nombre. Al editar aparece "Eliminar". Se remonta con `key` en
  cada apertura.

  Recibe:
    - controller: useModal
    - trainer: entrenador a editar, o null para alta
    - onSave: ({ nombre, esp, clientes, clases, activo }) => void
    - onDelete: () => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import styles from '../../../components/FormModal/formModal.module.css';

/* Estado como par de opciones (Disponible = activo). */
const ESTADO_OPTIONS = [
  { value: 'disponible', label: 'Disponible', color: 'var(--ok)', bg: 'var(--ok-bg)' },
  { value: 'ausente', label: 'Ausente', color: 'var(--text-soft)', bg: 'var(--border-1)' },
];

export default function TrainerModal({ controller, trainer, onSave, onDelete }) {
  const isEdit = !!trainer;
  const [nombre, setNombre] = useState(trainer?.nombre || '');
  const [esp, setEsp] = useState(trainer?.esp || '');
  const [clientes, setClientes] = useState(trainer ? String(trainer.clientes) : '');
  const [clases, setClases] = useState(trainer ? String(trainer.clases) : '');
  const [estado, setEstado] = useState(trainer && !trainer.activo ? 'ausente' : 'disponible');

  const canSave = nombre.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), esp: esp.trim(), clientes, clases, activo: estado === 'disponible' });
  };

  return (
    <Modal controller={controller} width={480}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="trainers" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar entrenador' : 'Nuevo entrenador'}</span>
          <span className={styles.subtitle}>{isEdit ? 'Modifica los datos o elimina el entrenador' : 'Agrega un miembro del staff'}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre">
          <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Camila Rojas" autoFocus />
        </Field>
        <Field label="Especialidad">
          <input className={styles.input} value={esp} onChange={(e) => setEsp(e.target.value)} placeholder="Ej: Spinning · Cardio" />
        </Field>
        <div className={styles.grid}>
          <Field label="Clientes">
            <input className={styles.input} value={clientes} onChange={(e) => setClientes(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
          <Field label="Clases">
            <input className={styles.input} value={clases} onChange={(e) => setClases(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
        </div>
        <Field label="Estado">
          <SegmentedOptions options={ESTADO_OPTIONS} value={estado} onChange={setEstado} columns={2} />
        </Field>
      </div>

      <div className={styles.footer}>
        {isEdit && (
          <button type="button" className={styles.delete} onClick={onDelete}>✕ Eliminar</button>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Crear entrenador'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
