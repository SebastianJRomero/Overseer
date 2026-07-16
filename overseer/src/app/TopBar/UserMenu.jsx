/*
  UserMenu — Avatar de la TopBar + popover de cuenta.

  El botón muestra las iniciales del usuario logueado; al hacer clic se
  abre un popover (animación menuIn) con la cabecera de la cuenta y dos
  acciones: "Cambiar de usuario" y "Cerrar sesión" — ambas vuelven al
  login limpiando la sesión (via SessionProvider → authService).

  El clic en cualquier punto fuera del popover lo cierra (overlay
  invisible a pantalla completa, mismo mecanismo del prototipo).
*/

import { useState } from 'react';
import { useSession } from '../../context/SessionProvider';
import { getInitials } from '../../lib/initials';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, logout, switchUser } = useSession();
  const [open, setOpen] = useState(false);
  const name = user || 'Admin';

  return (
    <>
      <button
        type="button"
        title="Cuenta"
        className={open ? `${styles.avatarBtn} ${styles.avatarBtnOpen}` : styles.avatarBtn}
        onClick={() => setOpen(!open)}
      >
        {getInitials(name)}
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
            {/* cabecera de la cuenta */}
            <div className={styles.header}>
              <span className={styles.headerAvatar}>{getInitials(name)}</span>
              <div className={styles.headerTexts}>
                <span className={styles.headerName}>{name}</span>
                <span className={styles.headerRole}>Administrador</span>
              </div>
            </div>

            {/* acciones */}
            <div className={styles.actions}>
              <button type="button" className={styles.action} onClick={switchUser}>
                <span className={styles.actionIcon}>⇄</span>
                <span>Cambiar de usuario</span>
              </button>
              <button type="button" className={`${styles.action} ${styles.actionDanger}`} onClick={logout}>
                <span className={`${styles.actionIcon} ${styles.actionIconDanger}`}>⏻</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
