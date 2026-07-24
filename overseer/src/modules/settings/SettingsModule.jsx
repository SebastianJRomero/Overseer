/*
  SettingsModule — Contenedor del módulo Ajustes (ARQUITECTURA §3).

  Solo ORQUESTA: carga los datos con useSettings, guarda qué sección está
  activa y monta el Component de esa sección (del registro settingsSections).
  El contenido se re-anima al cambiar de sección (setSwap), como el prototipo.

  Cabecera de la sección activa (icono + título + descripción) a la izquierda
  del contenido; a su izquierda, la sub-nav. Layout de 2 columnas.
*/

import { useState } from 'react';
import useSettings from './useSettings';
import useSwapAnimation from '../../hooks/useSwapAnimation';
import { SETTINGS_SECTIONS, DEFAULT_SECTION } from './settingsSections';
import SettingsNav from './components/SettingsNav';
import Icon from '../../components/Icon/Icon';
import styles from './settings.module.css';

export default function SettingsModule() {
  const settings = useSettings();
  const [section, setSection] = useState(DEFAULT_SECTION);

  const meta = SETTINGS_SECTIONS.find((s) => s.id === section) || SETTINGS_SECTIONS[0];
  const SectionComponent = meta.Component;
  const swap = useSwapAnimation(section, ['swapA', 'swapB']);

  return (
    <div className={styles.module}>
      {/* Encabezado del módulo */}
      <div className={styles.heading}>
        <span className={styles.title}>Ajustes</span>
        <span className={styles.subtitle}>Configuración general del sistema</span>
      </div>

      {/* Dos columnas: sub-nav + contenido de la sección */}
      <div className={styles.grid}>
        <SettingsNav sections={SETTINGS_SECTIONS} active={section} onSelect={setSection} />

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
