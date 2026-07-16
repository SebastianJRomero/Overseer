/*
  TopBarTabs — Tabs de navegación entre módulos.

  Se DERIVAN del registry filtrado por flags (getVisibleModules): jamás hay
  una lista de módulos escrita a mano aquí. Ocultar un módulo en Ajustes lo
  quita de estos tabs sin tocar este archivo.
*/

import { useModules } from '../../context/ModulesProvider';
import { getVisibleModules } from '../moduleRegistry';
import Icon from '../../components/Icon/Icon';
import styles from './TopBar.module.css';

export default function TopBarTabs() {
  const { active, setActive, flags } = useModules();
  const modules = getVisibleModules(flags);

  return (
    <nav className={styles.tabs}>
      {modules.map((m) => (
        <button
          key={m.id}
          type="button"
          className={m.id === active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActive(m.id)}
        >
          <span className={styles.tabIcon}>
            <Icon name={m.icon} />
          </span>
          <span>{m.label}</span>
        </button>
      ))}
    </nav>
  );
}
