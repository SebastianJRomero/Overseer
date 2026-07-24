/*
  SettingsNav — Sub-navegación lateral de Ajustes.

  Se construye mapeando el registro SETTINGS_SECTIONS. La sección activa se
  resalta con fondo, texto claro y una barra de acento a la izquierda.

  Recibe:
    - sections: SETTINGS_SECTIONS (metas con { id, icon, label, desc })
    - active: id de la sección activa
    - onSelect: (id) => void
*/

import Icon from '../../../components/Icon/Icon';
import styles from './SettingsNav.module.css';

export default function SettingsNav({ sections, active, onSelect }) {
  return (
    <nav className={styles.nav}>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={s.id === active ? `${styles.item} ${styles.active}` : styles.item}
          onClick={() => onSelect(s.id)}
        >
          <span className={styles.bar} />
          <span className={styles.icon}><Icon name={s.icon} /></span>
          <span className={styles.texts}>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.desc}>{s.desc}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
