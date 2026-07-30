/*
  UserModal — Ajustes → Cuentas → Nuevo usuario (modal 560px).

  Toma el patrón de la ficha de miembro: columna de FOTO (subible) + badge del
  rol a la izquierda, y a la derecha una grilla de campos (nombre, usuario o
  correo, cédula, teléfono, contraseña), el selector de rol y una CHECKLIST de
  solo lectura con los accesos que concede ese rol (para que el Admin controle
  qué está otorgando).

  - "Usuario o correo" se guarda en el campo `email` (el login matchea por
    email o por nombre). La contraseña no se persiste.
  - Cédula, teléfono y foto son opcionales; obligatorios: nombre, usuario/correo
    y contraseña.

  Recibe:
    - controller: useModal
    - onSave: ({ nombre, email, rol, cedula, telefono, foto }) => void
*/

import { useRef, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { getInitials } from '../../../lib/initials';
import { onlyDigits } from '../../../lib/format';
import { ROLE_STYLES } from '../roleStyles';
import { ACCESS_FUNCTIONS, roleCan } from '../rolePermissions';
import chrome from './SettingsModal.module.css';
import styles from './UserModal.module.css';

const ROLE_OPTIONS = ['Admin', 'Recepción', 'Entrenador'].map((r) => ({
  value: r, label: r, color: ROLE_STYLES[r].color, bg: ROLE_STYLES[r].bg,
}));

const mono = { fontFamily: 'var(--font-mono)' };

export default function UserModal({ controller, onSave }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState('');
  const [rol, setRol] = useState('Recepción');
  const fileRef = useRef(null);

  const canSave = nombre.trim() && email.trim() && pass.length > 0;
  const rs = ROLE_STYLES[rol] || ROLE_STYLES.Recepción;

  // Foto: se lee como data URL y se muestra al instante (igual que en Miembros).
  const onPhotoPick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), email: email.trim(), rol, cedula, telefono, foto });
  };

  return (
    <Modal controller={controller} width={560}>
      <div className={chrome.header}>
        <span className={chrome.headIcon}><Icon name="members" /></span>
        <div className={chrome.heading}>
          <span className={chrome.title}>Nuevo usuario</span>
          <span className={chrome.subtitle}>Crea una cuenta de acceso al sistema</span>
        </div>
        <button type="button" className={chrome.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        {/* Columna izquierda: foto (subible) + badge del rol elegido */}
        <div className={styles.photoCol}>
          <button type="button" className={styles.photo} title="Subir foto" onClick={() => fileRef.current?.click()}>
            {foto ? (
              <img className={styles.photoImg} src={foto} alt="Foto de la cuenta" />
            ) : (
              <>
                <span className={styles.photoInitials}>{nombre.trim() ? getInitials(nombre) : '◐'}</span>
                <span className={styles.photoLabel}>SUBIR FOTO</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhotoPick} hidden />
          <span className={styles.roleBadge} style={{ color: rs.color, background: rs.bg }}>{rol}</span>
        </div>

        {/* Columna derecha: campos + rol + accesos */}
        <div className={styles.mainCol}>
          <div className={styles.grid}>
            <div className={styles.full}>
              <Field label="Nombre">
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Paula Méndez" autoFocus />
              </Field>
            </div>
            <div className={styles.full}>
              <Field label="Usuario o correo">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paula  ·  usuario@overseer.gym" style={mono} />
              </Field>
            </div>
            <Field label="Cédula">
              <input value={cedula} onChange={(e) => setCedula(onlyDigits(e.target.value))} placeholder="Solo números" style={mono} inputMode="numeric" />
            </Field>
            <Field label="Teléfono">
              <input value={telefono} onChange={(e) => setTelefono(onlyDigits(e.target.value))} placeholder="Solo números" style={mono} inputMode="numeric" />
            </Field>
            <div className={styles.full}>
              <Field label="Contraseña">
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" style={mono} />
              </Field>
            </div>
          </div>

          <Field label="Rol">
            <SegmentedOptions options={ROLE_OPTIONS} value={rol} onChange={setRol} columns={3} />
          </Field>

          {/* Accesos del rol (solo lectura): qué puede usar el rol elegido. */}
          <div className={styles.access}>
            <span className={styles.accessTitle}>Accesos de este rol</span>
            <div className={styles.accessGrid}>
              {ACCESS_FUNCTIONS.map((fn) => {
                const on = roleCan(rol, fn);
                return (
                  <span key={fn} className={on ? `${styles.accessItem} ${styles.accessOn}` : styles.accessItem}>
                    <span className={styles.check}>{on ? '✓' : '·'}</span>
                    {fn}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={chrome.footer}>
        <div className={chrome.actions}>
          <button type="button" className={chrome.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={chrome.save} disabled={!canSave} onClick={save}>Crear usuario</button>
        </div>
      </div>
    </Modal>
  );
}
