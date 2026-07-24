/*
  ClassModal — Nueva / editar clase grupal (modal 500px).

  Nombre, entrenador, días, hora e inscritos/cupo. Guardar se bloquea sin
  nombre. Al editar aparece "Eliminar". Se remonta con `key` en cada apertura,
  así el estado inicial se toma limpio de `clase`.

  Recibe:
    - controller: useModal
    - clase: clase a editar, o null para alta
    - onSave: ({ nombre, coach, dias, hora, inscritos, cupo }) => void
    - onDelete: () => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import Icon from '../../../components/Icon/Icon';
import styles from '../../../components/FormModal/formModal.module.css';

export default function ClassModal({ controller, clase, onSave, onDelete }) {
  const isEdit = !!clase;
  const [nombre, setNombre] = useState(clase?.nombre || '');
  const [coach, setCoach] = useState(clase?.coach || '');
  const [dias, setDias] = useState(clase?.dias || '');
  const [hora, setHora] = useState(clase?.hora || '');
  const [inscritos, setInscritos] = useState(clase ? String(clase.inscritos) : '');
  const [cupo, setCupo] = useState(clase ? String(clase.cupo) : '');

  const canSave = nombre.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), coach: coach.trim(), dias: dias.trim(), hora: hora.trim(), inscritos, cupo });
  };

  return (
    <Modal controller={controller} width={500}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="classes" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar clase' : 'Nueva clase'}</span>
          <span className={styles.subtitle}>{isEdit ? 'Modifica los detalles o elimina la clase' : 'Programa una clase grupal'}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre de la clase">
          <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Spinning" autoFocus />
        </Field>
        <Field label="Entrenador">
          <input className={styles.input} value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Ej: Camila Rojas" />
        </Field>
        <div className={styles.grid}>
          <Field label="Días">
            <input className={styles.input} value={dias} onChange={(e) => setDias(e.target.value)} placeholder="Ej: Lun · Mié · Vie" />
          </Field>
          <Field label="Hora">
            <input className={styles.input} value={hora} onChange={(e) => setHora(e.target.value)} placeholder="Ej: 06:00" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
        </div>
        <div className={styles.grid}>
          <Field label="Inscritos">
            <input className={styles.input} value={inscritos} onChange={(e) => setInscritos(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
          <Field label="Cupo">
            <input className={styles.input} value={cupo} onChange={(e) => setCupo(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="20" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>
        </div>
      </div>

      <div className={styles.footer}>
        {isEdit && (
          <button type="button" className={styles.delete} onClick={onDelete}>✕ Eliminar</button>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Crear clase'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
