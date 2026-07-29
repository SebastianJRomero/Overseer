/*
  UserMenu — Avatar de la TopBar + popover de cuenta.

  El botón muestra las iniciales del usuario logueado; al hacer clic se
  abre un popover (animación menuIn) con la cabecera de la cuenta y dos
  acciones: "Cambiar de usuario" y "Cerrar sesión" — ambas vuelven al
  login limpiando la sesión (via SessionProvider → authService).

  IMPORTANTE — por qué un PORTAL: la TopBar usa backdrop-filter, que crea
  un "contexto de apilamiento". Cualquier z-index de un hijo (como este
  popover) queda ATRAPADO dentro de la barra y se pinta DEBAJO del área de
  módulos (la tabla). Eso hacía que el menú se viera detrás y que sus
  botones no recibieran el clic. Renderizándolo en document.body con un
  portal, el overlay vive fuera de la barra y se apila por encima de todo.
*/

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from '../../context/SessionProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { getInitials } from '../../lib/initials';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, logout, switchUser } = useSession();
  const { tema, setAppearance } = useTheme();
  const [open, setOpen] = useState(false);
  const name = user || 'Admin';
  const isDark = tema !== 'claro';

  const close = () => setOpen(false);

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

      {/* El popover se monta en <body> (portal) para escapar del contexto
          de apilamiento de la barra. El overlay a pantalla completa cierra
          al hacer clic fuera; el menú detiene la propagación. */}
      {open && createPortal(
        <div className={styles.overlay} onClick={close}>
          <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <span className={styles.headerAvatar}>{getInitials(name)}</span>
              <div className={styles.headerTexts}>
                <span className={styles.headerName}>{name}</span>
                <span className={styles.headerRole}>Administrador</span>
              </div>
            </div>

            <div className={styles.actions}>
              {/* Toggle de tema — alterna claro/oscuro sin cerrar el menú. */}
              <button type="button" className={styles.action} onClick={() => setAppearance({ tema: isDark ? 'claro' : 'oscuro' })}>
                <span className={styles.actionIcon}>{isDark ? '☀' : '☾'}</span>
                <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
              <button type="button" className={styles.action} onClick={() => { close(); switchUser(); }}>
                <span className={styles.actionIcon}>⇄</span>
                <span>Cambiar de usuario</span>
              </button>
              <button type="button" className={`${styles.action} ${styles.actionDanger}`} onClick={() => { close(); logout(); }}>
                <span className={`${styles.actionIcon} ${styles.actionIconDanger}`}>⏻</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
