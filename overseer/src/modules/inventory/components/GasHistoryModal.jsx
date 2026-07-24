/*
  GasHistoryModal — Historial de usos de un cilindro (modal 560px).

  Lista los usos del más reciente al más antiguo; cada fila abre la edición
  de ese uso. Cabecera con el destino y el resumen (comprado / capacidad) y,
  si el cilindro sigue en uso, botón "＋ Registrar uso".

  Recibe:
    - controller: useModal
    - cyl: cilindro (enriquecido) o null
    - onEditUso: (uso) => void
    - onAddUso: () => void
*/

import Modal from '../../../components/Modal/Modal';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Icon from '../../../components/Icon/Icon';
import { parseDMY } from '../../../lib/date';
import { getDestinoStyle, SERVICE_STYLES } from '../inventoryStyles';
import modal from './InventoryModal.module.css';
import styles from './GasTab.module.css';

export default function GasHistoryModal({ controller, cyl, onEditUso, onAddUso }) {
  if (!cyl) return null;
  const dest = getDestinoStyle(cyl.destino);

  // Más reciente primero (el service no ordena; es una decisión de vista).
  const usos = (cyl.usos || []).slice().sort((a, b) => (parseDMY(b.fecha) || 0) - (parseDMY(a.fecha) || 0));

  return (
    <Modal controller={controller} width={560}>
      <div className={modal.header}>
        <span className={modal.headIcon} style={{ color: dest.color, background: dest.bg }}><Icon name="gas" /></span>
        <div className={modal.heading}>
          <span className={modal.title}>Historial de uso · {dest.label}</span>
          <span className={modal.subtitle}>Comprado el {cyl.compra} · {cyl.capLb} lb · {cyl.usosCount} usos</span>
        </div>
        {!cyl.finalizado && (
          <button type="button" className={modal.save} onClick={onAddUso}>＋ Registrar uso</button>
        )}
        <button type="button" className={modal.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.usoList}>
        {usos.length > 0 ? usos.map((u) => {
          const sv = SERVICE_STYLES[u.servicio] || SERVICE_STYLES.Sauna;
          return (
            <button key={u.id} type="button" className={styles.usoRow} onClick={() => onEditUso(u)} title="Editar uso">
              <span className={styles.usoBadge} style={{ color: sv.color, background: sv.bg }}>{u.servicio}</span>
              <span className={styles.usoInfo}>
                <span className={styles.usoFecha}>{u.fecha} · {u.hora}</span>
                <span className={styles.usoObs}>{u.obs && u.obs.trim() ? u.obs : '—'}</span>
              </span>
              <span className={styles.usoEdit}><Icon name="edit" /></span>
            </button>
          );
        }) : (
          <EmptyState>Este cilindro aún no tiene usos registrados.</EmptyState>
        )}
      </div>
    </Modal>
  );
}
