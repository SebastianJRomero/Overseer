/*
  UserModal — Ajustes → Cuentas → Nuevo usuario (modal 480px).

  Nombre, correo, contraseña y rol (SegmentedOptions). Guardar se bloquea si
  falta algún campo. La contraseña no se persiste (el mock la descarta; en la
  API real la recibiría el backend).

  Recibe:
    - controller: useModal
    - onSave: ({ nombre, email, rol }) => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { ROLE_STYLES } from '../roleStyles';
import styles from './SettingsModal.module.css';

const ROLE_OPTIONS = ['Admin', 'Recepción', 'Entrenador'].map((r) => ({
  value: r, label: r, color: ROLE_STYLES[r].color, bg: ROLE_STYLES[r].bg,
}));

export default function UserModal({ controller, onSave }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [rol, setRol] = useState('Recepción');

  const canSave = nombre.trim() && email.trim() && pass.length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), email: email.trim(), rol });
  };

  return (
    <Modal controller={controller} width={480}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="members" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>Nuevo usuario</span>
          <span className={styles.subtitle}>Crea una cuenta de acceso al sistema</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre de usuario">
          <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Paula Méndez" autoFocus />
        </Field>
        <Field label="Correo electrónico">
          <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@overseer.gym" style={{ fontFamily: 'var(--font-mono)' }} />
        </Field>
        <Field label="Contraseña">
          <input className={styles.input} type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" style={{ fontFamily: 'var(--font-mono)' }} />
        </Field>
        <Field label="Rol">
          <SegmentedOptions options={ROLE_OPTIONS} value={rol} onChange={setRol} columns={3} />
        </Field>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>Crear usuario</button>
        </div>
      </div>
    </Modal>
  );
}
