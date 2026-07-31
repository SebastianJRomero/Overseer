/*
  UserModal — Crear / editar una cuenta (modal 560px), al estilo de la ficha de
  miembro: columna de FOTO subible + badge de rol, y a la derecha una grilla de
  campos (nombre, usuario o correo, cédula, teléfono, contraseña) y una CHECKLIST
  de accesos EDITABLE (activar/desactivar por función). La contraseña se manda al
  backend y se guarda HASHEADA (auth real); al editar, en blanco = no cambiarla.

  Elegir un rol precarga sus accesos por defecto (rolePermissions); luego el
  Admin puede afinar función por función para dar más o menos permisos a esa
  cuenta concreta. Los permisos se guardan por usuario (aún no restringen la
  navegación — eso sería enforcement, fuera de alcance).

  - "Usuario o correo" se guarda en `email` (el login matchea por email o nombre).
  - En edición, el botón Eliminar vive en el pie del modal (solo Admin, nunca la
    propia cuenta) con confirmación.

  Recibe:
    - controller: useModal
    - mode: 'add' | 'edit'
    - user: cuenta a editar (solo edit)
    - canDelete: boolean (edit): muestra Eliminar
    - onSave:   (datos) => void        (crear)
    - onUpdate: (id, patch) => void     (editar)
    - onDelete: (id) => void            (eliminar)
*/

import { useRef, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { getInitials } from '../../../lib/initials';
import { onlyDigits } from '../../../lib/format';
import { ROLE_STYLES } from '../roleStyles';
import { ACCESS_FUNCTIONS, ROLE_ACCESS } from '../rolePermissions';
import chrome from './SettingsModal.module.css';
import styles from './UserModal.module.css';

const ROLE_OPTIONS = ['Admin', 'Recepción', 'Entrenador'].map((r) => ({
  value: r, label: r, color: ROLE_STYLES[r].color, bg: ROLE_STYLES[r].bg,
}));

const mono = { fontFamily: 'var(--font-mono)' };

export default function UserModal({ controller, mode = 'add', user, canDelete, onSave, onUpdate, onDelete }) {
  const isEdit = mode === 'edit';
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [pass, setPass] = useState('');
  const [cedula, setCedula] = useState(user?.cedula || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [foto, setFoto] = useState(user?.foto || '');
  const [rol, setRol] = useState(user?.rol || 'Recepción');
  const [permisos, setPermisos] = useState(
    () => (user?.permisos?.length ? user.permisos : (ROLE_ACCESS[user?.rol || 'Recepción'] || [])),
  );
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null);

  const rs = ROLE_STYLES[rol] || ROLE_STYLES.Recepción;
  const canSave = nombre.trim() && email.trim() && (isEdit || pass.length > 0);

  // Elegir rol precarga sus accesos por defecto (luego se afinan a mano).
  const pickRole = (r) => { setRol(r); setPermisos(ROLE_ACCESS[r] || []); };
  const togglePermiso = (fn) => setPermisos((p) => (p.includes(fn) ? p.filter((x) => x !== fn) : [...p, fn]));

  const onPhotoPick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!canSave) return;
    const datos = { nombre: nombre.trim(), email: email.trim(), rol, cedula, telefono, foto, permisos };
    // La contraseña se envía al crear siempre; al editar, solo si se escribió
    // una nueva (en blanco = conservar la actual).
    if (pass) datos.pass = pass;
    if (isEdit) onUpdate(user.id, datos);
    else onSave(datos);
  };

  return (
    <Modal controller={controller} width={560}>
      <div className={chrome.header}>
        <span className={chrome.headIcon}><Icon name="members" /></span>
        <div className={chrome.heading}>
          <span className={chrome.title}>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</span>
          <span className={chrome.subtitle}>{isEdit ? 'Actualiza los datos y accesos de la cuenta' : 'Crea una cuenta de acceso al sistema'}</span>
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
              <Field label={isEdit ? 'Contraseña (en blanco = no cambiar)' : 'Contraseña'}>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder={isEdit ? 'Dejar en blanco para conservarla' : '••••••••'}
                  style={mono}
                />
              </Field>
            </div>
          </div>

          <Field label="Rol">
            <SegmentedOptions options={ROLE_OPTIONS} value={rol} onChange={pickRole} columns={3} />
          </Field>

          {/* Accesos EDITABLES: activar/desactivar cada función para esta cuenta. */}
          <div className={styles.access}>
            <span className={styles.accessTitle}>Accesos de la cuenta · clic para activar o desactivar</span>
            <div className={styles.accessGrid}>
              {ACCESS_FUNCTIONS.map((fn) => {
                const on = permisos.includes(fn);
                return (
                  <button
                    type="button"
                    key={fn}
                    className={on ? `${styles.accessItem} ${styles.accessOn}` : styles.accessItem}
                    onClick={() => togglePermiso(fn)}
                  >
                    <span className={styles.check}>{on ? '✓' : '·'}</span>
                    {fn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={chrome.footer}>
        {/* Eliminar (edición · Admin · no la propia cuenta) con confirmación. */}
        {isEdit && canDelete && (confirmDel ? (
          <span className={styles.confirmDel}>
            <span className={styles.confirmText}>¿Eliminar cuenta?</span>
            <button type="button" className={styles.yes} onClick={() => onDelete(user.id)}>Sí</button>
            <button type="button" className={styles.no} onClick={() => setConfirmDel(false)}>No</button>
          </span>
        ) : (
          <button type="button" className={styles.delBtn} onClick={() => setConfirmDel(true)}>Eliminar cuenta</button>
        ))}

        <div className={chrome.actions}>
          <button type="button" className={chrome.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={chrome.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
