/*
  EquipmentRow — Una fila de la tabla de máquinas y equipos.

  Nombre + última revisión, badge de estado, observaciones y unidades. Clic
  en la fila abre el modal de edición.

  Recibe:
    - equip: { id, nombre, cantidad, estado, revision, obs }
    - onEdit: (equip) => void
*/

import { EQUIPMENT_STATUS_STYLES } from '../inventoryStyles';
import styles from './InventoryPanel.module.css';

export default function EquipmentRow({ equip, onEdit }) {
  const es = EQUIPMENT_STATUS_STYLES[equip.estado] || EQUIPMENT_STATUS_STYLES.Operativo;

  return (
    <button
      type="button"
      className={`${styles.row} ${styles.gridEquip} ${styles.rowClickable}`}
      onClick={() => onEdit(equip)}
      title="Editar equipo"
    >
      <span className={styles.nameCell}>
        <span className={styles.name}>{equip.nombre}</span>
        <span className={styles.sub}>Últ. revisión · {equip.revision}</span>
      </span>

      <span className={styles.statusCell} style={{ color: es.color, background: es.bg }}>
        <span className={styles.statusDot} style={{ background: es.dot }} />
        {equip.estado}
      </span>

      <span className={styles.obs}>{equip.obs || '—'}</span>

      <span className={styles.numCell}>
        <span className={styles.num} style={{ color: 'var(--text-mid)' }}>{equip.cantidad}</span>
        <span className={styles.numLabel}>unidades</span>
      </span>
    </button>
  );
}
