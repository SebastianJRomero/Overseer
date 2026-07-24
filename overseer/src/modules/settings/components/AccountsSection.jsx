/*
  AccountsSection — Ajustes → Cuentas y roles.

  Lista de usuarios del sistema (con alta por modal) y la leyenda de roles y
  permisos. El alta persiste vía usersService; la contraseña no se guarda.

  Recibe (de useSettings): users, createUser.
*/

import useModal from '../../../hooks/useModal';
import { getInitials } from '../../../lib/initials';
import { ROLE_LEGEND } from '../../../services/usersService';
import SettingsCard from './SettingsCard';
import UserModal from './UserModal';
import { ROLE_STYLES } from '../roleStyles';
import shared from './SettingsShared.module.css';
import styles from './AccountsSection.module.css';

export default function AccountsSection({ users, createUser }) {
  const modal = useModal();

  const save = async (datos) => {
    await createUser(datos);
    modal.close();
  };

  const addBtn = (
    <button type="button" className={shared.addBtn} onClick={modal.open}>＋ Nuevo usuario</button>
  );

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Usuarios del sistema" action={addBtn}>
        {users.map((u) => {
          const rs = ROLE_STYLES[u.rol] || ROLE_STYLES.Recepción;
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
