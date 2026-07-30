/*
  AccountsSection — Ajustes → Cuentas y roles.

  Lista de usuarios del sistema y la leyenda de roles y permisos.

  Gestión de cuentas SOLO para Admin (frente 4): crear y eliminar cuentas se
  ofrecen únicamente si la sesión tiene rol 'Admin' (useSession().role). Además,
  nunca se puede eliminar la propia cuenta. Eliminar pide confirmación inline.
  Para los demás roles la sección es de solo lectura.

  Recibe (de useSettings): users, createUser, deleteUser.
*/

import { useState } from 'react';
import { useSession } from '../../../context/SessionProvider';
import useModal from '../../../hooks/useModal';
import { getInitials } from '../../../lib/initials';
import { ROLE_LEGEND } from '../../../services/usersService';
import SettingsCard from './SettingsCard';
import UserModal from './UserModal';
import { ROLE_STYLES } from '../roleStyles';
import shared from './SettingsShared.module.css';
import styles from './AccountsSection.module.css';

export default function AccountsSection({ users, createUser, deleteUser }) {
  const { role, userId } = useSession();
  const isAdmin = role === 'Admin';
  const modal = useModal();
  const [confirmId, setConfirmId] = useState(null); // fila en modo confirmar

  const save = async (datos) => {
    await createUser(datos);
    modal.close();
  };

  const remove = async (id) => {
    await deleteUser(id);
    setConfirmId(null);
  };

  // Alta solo para Admin; para el resto, la sección es de solo lectura.
  const addBtn = isAdmin
    ? <button type="button" className={shared.addBtn} onClick={modal.open}>＋ Nuevo usuario</button>
    : null;
  const subtitle = isAdmin ? undefined : 'Solo un administrador puede crear o eliminar cuentas';

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Usuarios del sistema" subtitle={subtitle} action={addBtn}>
        {users.map((u) => {
          const rs = ROLE_STYLES[u.rol] || ROLE_STYLES.Recepción;
          const canDelete = isAdmin && u.id !== userId; // nunca la propia cuenta
          return (
            <div key={u.id} className={`${shared.row} ${shared.rowHover}`}>
              <span className={styles.avatar}>{getInitials(u.nombre)}</span>
              <div className={shared.rowInfo}>
                <span className={shared.rowLabel}>{u.nombre}</span>
                <span className={styles.email}>{u.email}</span>
              </div>
              <span className={styles.roleBadge} style={{ color: rs.color, background: rs.bg }}>{u.rol}</span>
              <span className={styles.activity} style={{ color: u.activo ? 'var(--ok)' : 'var(--text-soft)' }}>
                <span className={styles.dot} style={{ background: u.activo ? 'var(--ok-strong)' : 'var(--text-faint)' }} />
                {u.activity}
              </span>

              {/* Eliminar (solo Admin, no la propia cuenta) con confirmación inline. */}
              {canDelete && (confirmId === u.id ? (
                <span className={styles.confirm}>
                  <span className={styles.confirmText}>¿Eliminar?</span>
                  <button type="button" className={styles.yes} onClick={() => remove(u.id)}>Sí</button>
                  <button type="button" className={styles.no} onClick={() => setConfirmId(null)}>No</button>
                </span>
              ) : (
                <button type="button" className={styles.delBtn} title={`Eliminar a ${u.nombre}`} onClick={() => setConfirmId(u.id)}>
                  Eliminar
                </button>
              ))}
            </div>
          );
        })}
      </SettingsCard>

      <SettingsCard title="Roles y permisos">
        {ROLE_LEGEND.map((r) => {
          const rs = ROLE_STYLES[r.rol] || ROLE_STYLES.Recepción;
          return (
            <div key={r.rol} className={styles.roleRow}>
              <span className={styles.roleBadge} style={{ color: rs.color, background: rs.bg }}>{r.rol}</span>
              <span className={styles.perms}>{r.perms}</span>
            </div>
          );
        })}
      </SettingsCard>

      <UserModal controller={modal} onSave={save} />
    </div>
  );
}
