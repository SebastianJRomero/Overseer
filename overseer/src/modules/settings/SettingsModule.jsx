/*
  SettingsModule — Contenedor del módulo Ajustes (ARQUITECTURA §3).

  Solo ORQUESTA: carga los datos con useSettings, guarda qué sección está
  activa y monta el Component de esa sección (del registro settingsSections).
  El contenido se re-anima al cambiar de sección (setSwap), como el prototipo.

  Cabecera de la sección activa (icono + título + descripción) a la izquierda
  del contenido; a su izquierda, la sub-nav. Layout de 2 columnas.
*/

import { useEffect, useState } from 'react';
import useSettings from './useSettings';
import useSwapAnimation from '../../hooks/useSwapAnimation';
import { SETTINGS_SECTIONS, MAINTENANCE_SECTION, DEFAULT_SECTION } from './settingsSections';
import { useSession } from '../../context/SessionProvider';
import SettingsNav from './components/SettingsNav';
import Icon from '../../components/Icon/Icon';
import { getVersion } from '../../services/settingsService';
import styles from './settings.module.css';

export default function SettingsModule() {
  const settings = useSettings();
  const { isSuper } = useSession();
  const [section, setSection] = useState(DEFAULT_SECTION);
  const [unlocked, setUnlocked] = useState(false); // atajo secreto revelado
  const [version, setVersion] = useState('');

  // SOLO el superusuario (credencial maestra) alcanza el menú de mantenimiento.
  // NO se gatea por rol: el login es permisivo (cualquier usuario entra como
  // Admin por fallback, ver routes/auth.js), así que gatear por 'Admin' lo
  // dejaría abierto a CUALQUIER login. El menú es del superusuario y punto.
  const canMaintain = isSuper;

  // Versión del sistema (backend → desktop/package.json).
  useEffect(() => {
    getVersion().then((v) => setVersion(`v${v?.version || '1.0.5'}`)).catch(() => {});
  }, []);

  // Atajo secreto (Ctrl+Shift+M): revela la sección oculta y salta a ella.
  // Sin permiso no hace nada (ni siquiera revela que existe).
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        if (!canMaintain) return;
        setUnlocked(true);
        setSection(MAINTENANCE_SECTION.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canMaintain]);

  // La sección de mantenimiento se anexa a la nav SOLO si está desbloqueada y
  // el usuario tiene permiso; si no, la lista es la de siempre.
  const sections = unlocked && canMaintain ? [...SETTINGS_SECTIONS, MAINTENANCE_SECTION] : SETTINGS_SECTIONS;

  const meta = sections.find((s) => s.id === section) || SETTINGS_SECTIONS[0];
  const SectionComponent = meta.Component;
  const swap = useSwapAnimation(meta.id, ['swapA', 'swapB']);

  return (
    <div className={styles.module}>
      {/* Encabezado del módulo */}
      <div className={styles.heading}>
        <span className={styles.title}>Ajustes</span>
        <span className={styles.subtitle}>Configuración general del sistema</span>
        {version && <span className={styles.version}>OVERSEER {version}</span>}
      </div>

      {/* Dos columnas: sub-nav + contenido de la sección */}
      <div className={styles.grid}>
        <SettingsNav sections={sections} active={meta.id} onSelect={setSection} />

        <div className={styles.content}>
          {/* Cabecera de la sección activa */}
          <div className={styles.secHead}>
            <span className={styles.secIcon}><Icon name={meta.icon} /></span>
            <div className={styles.secHeading}>
              <span className={styles.secTitle}>{meta.label}</span>
              <span className={styles.secDesc}>{meta.desc}</span>
            </div>
          </div>

          {/* Cuerpo de la sección (se re-anima al cambiar) */}
          <div style={{ animation: swap }}>
            <SectionComponent {...settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
