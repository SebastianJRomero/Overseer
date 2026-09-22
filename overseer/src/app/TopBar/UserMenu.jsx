/*
  UserMenu — Avatar de la TopBar + popover de cuenta.

  El botón muestra las iniciales del usuario logueado; al hacer clic se
  abre un popover (animación menuIn) con la cabecera de la cuenta (nombre +
  rol), el toggle de tema claro/oscuro y "Cerrar sesión" (vuelve al login
  limpiando la sesión via SessionProvider → authService).

  IMPORTANTE — por qué un PORTAL: la TopBar usa backdrop-filter, que crea
  un "contexto de apilamiento". Cualquier z-index de un hijo (como este
  popover) queda ATRAPADO dentro de la barra y se pinta DEBAJO del área de
  módulos (la tabla). Eso hacía que el menú se viera detrás y que sus
  botones no recibieran el clic. Renderizándolo en document.body con un
  portal, el overlay vive fuera de la barra y se apila por encima de todo.
*/

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from '../../context/SessionProvider';
import { useTheme, ZOOM_MIN, ZOOM_MAX } from '../../theme/ThemeProvider';
import { getInitials } from '../../lib/initials';
import { getVersion } from '../../services/settingsService';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, role, logout } = useSession();
  const { tema, zoom, setAppearance } = useTheme();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState('');
  const name = user || 'Admin';
  const roleLabel = role || 'Administrador';
  const isDark = tema !== 'claro';

  const close = () => setOpen(false);

  // Versión del sistema (backend → desktop/package.json). Se carga al abrir.
  useEffect(() => {
    if (!open || version) return;
    getVersion().then((v) => setVersion(`v${v?.version || '1.0.5'}`)).catch(() => {});
  }, [open, version]);

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
                <span className={styles.headerRole}>{roleLabel}</span>
              </div>
            </div>

            {/* Zoom de la interfaz — deslizante sutil (85–115%). Reduce para que
                los modales quepan sin scroll; aumenta para más detalle. */}
            <div className={styles.zoomBlock}>
              <div className={styles.zoomTop}>
                <span className={styles.zoomLabel}>Zoom</span>
                <span className={styles.zoomValue}>{zoom}%</span>
              </div>
              <input
                type="range"
                className={styles.zoomSlider}
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={5}
                value={zoom}
                onChange={(e) => setAppearance({ zoom: Number(e.target.value) })}
                aria-label="Zoom de la interfaz"
              />
            </div>

            <div className={styles.actions}>
              {/* Toggle de tema — alterna claro/oscuro sin cerrar el menú. */}
              <button type="button" className={styles.action} onClick={() => setAppearance({ tema: isDark ? 'claro' : 'oscuro' })}>
                <span className={styles.actionIcon}>{isDark ? '☀' : '☾'}</span>
                <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
              <button type="button" className={`${styles.action} ${styles.actionDanger}`} onClick={() => { close(); logout(); }}>
                <span className={`${styles.actionIcon} ${styles.actionIconDanger}`}>⏻</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
            <div className={styles.version}>OVERSEER {version || 'v1.0.5'}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
