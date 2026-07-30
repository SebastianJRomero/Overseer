/*
  AccountsSection — Ajustes → Cuentas y roles.

  Lista de usuarios (estilo tabla de Miembros: cada fila es clicable y abre el
  modal para EDITAR la cuenta) y la leyenda de roles y permisos.

  Gestión de cuentas SOLO para Admin (frente 4): crear, editar y eliminar se
  ofrecen únicamente si la sesión tiene rol 'Admin'. El botón Eliminar vive
  dentro del modal de edición (nunca sobre la propia cuenta). Para los demás
  roles la sección es de solo lectura (filas no clicables).

  Recibe (de useSettings): users, createUser, updateUser, deleteUser.
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

export default function AccountsSection({ users, createUser, updateUser, deleteUser }) {
  const { role, userId } = useSession();
  const isAdmin = role === 'Admin';
  const modal = useModal();
  // mode + cuenta seleccionada; `key` remonta el modal en cada apertura (estado limpio).
  const [state, setState] = useState({ mode: 'add', user: null, key: 0 });

  const openAdd = () => { setState((s) => ({ mode: 'add', user: null, key: s.key + 1 })); modal.open(); };
  const openEdit = (u) => { if (isAdmin) { setState((s) => ({ mode: 'edit', user: u, key: s.key + 1 })); modal.open(); } };

  const save = async (datos) => { await createUser(datos); modal.close(); };
  const update = async (id, patch) => { await updateUser(id, patch); modal.close(); };
  const remove = async (id) => { await deleteUser(id); modal.close(); };

  const addBtn = isAdmin
    ? <button type="button" className={shared.addBtn} onClick={openAdd}>＋ Nuevo usuario</button>
    : null;
  const subtitle = isAdmin ? undefined : 'Solo un administrador puede gestionar cuentas';

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Usuarios del sistema" subtitle={subtitle} action={addBtn}>
        {users.map((u) => (
          <div
            key={u.id}
            className={isAdmin ? `${shared.row} ${styles.clickable}` : shared.row}
            onClick={isAdmin ? () => openEdit(u) : undefined}
            title={isAdmin ? 'Editar cuenta' : undefined}
          >
            <span className={styles.avatar}>{getInitials(u.nombre)}</span>
            <div className={styles.info}>
              <span className={styles.userName}>{u.nombre}</span>
              <span className={styles.email}>{u.email}</span>
            </div>
            <span className={styles.roleBadge} style={{ color: (ROLE_STYLES[u.rol] || ROLE_STYLES.Recepción).color, background: (ROLE_STYLES[u.rol] || ROLE_STYLES.Recepción).bg }}>{u.rol}</span>
            <span className={styles.activity} style={{ color: u.activo ? 'var(--ok)' : 'var(--text-soft)' }}>
              <span className={styles.dot} style={{ background: u.activo ? 'var(--ok-strong)' : 'var(--text-faint)' }} />
              {u.activity}
            </span>
          </div>
        ))}
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

      <UserModal
        key={state.key}
        controller={modal}
        mode={state.mode}
        user={state.user}
        canDelete={isAdmin && state.user?.id !== userId}
        onSave={save}
        onUpdate={update}
        onDelete={remove}
      />
    </div>
  );
}
