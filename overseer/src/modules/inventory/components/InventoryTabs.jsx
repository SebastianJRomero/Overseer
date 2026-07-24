/*
  InventoryTabs — Pastillas de sub-navegación (Productos / Equipo / Zona húmeda).

  Se construye mapeando el registro INVENTORY_TABS (no una lista fija): la
  activa se pinta con el gradiente de acento, las demás en gris. Cada pastilla
  lleva su icono a la izquierda.

  Recibe:
    - tabs: INVENTORY_TABS (metas con { id, label, icon })
    - active: id de la pestaña activa
    - onSelect: (id) => void
*/

import Icon from '../../../components/Icon/Icon';
import styles from './InventoryTabs.module.css';

export default function InventoryTabs({ tabs, active, onSelect }) {
  return (
    <div className={styles.bar}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={t.id === active ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => onSelect(t.id)}
        >
          <Icon name={t.icon} size={13} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
