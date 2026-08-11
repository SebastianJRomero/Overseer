/*
  MemberFilterModal — Lista de miembros filtrada por estado (modal 500px).

  Se abre desde los chips de la toolbar (y en fases siguientes desde los
  KPI del Inicio). Cabecera con el punto del color del filtro, título y
  conteo; cada fila abre la ficha del miembro (cerrando este modal).

  Recibe:
    - controller: useModal
    - filter: 'activos' | 'pronto' | 'vencidos' | null
    - members: lista completa CON status (el filtro se aplica aquí)
    - onOpenMember: (member) => void
*/

import Modal from '../../../components/Modal/Modal';
import Badge from '../../../components/Badge/Badge';
import { getInitials } from '../../../lib/initials';
import { formatShortDate } from '../../../lib/date';
import { STATUS } from '../../../lib/memberStatus';
import { ESTADO_STYLES } from '../memberStyles';
import styles from './MemberFilterModal.module.css';

/* Título, color y regla de cada filtro ("activos" = no vencidos). */
const FILTERS = {
  activos: { title: 'Miembros activos', color: 'var(--ok)', test: (m) => m.status !== STATUS.VENCIDO },
  pronto: { title: 'Vencen pronto', color: 'var(--warn)', test: (m) => m.status === STATUS.PRONTO },
  vencidos: { title: 'Miembros vencidos', color: 'var(--danger)', test: (m) => m.status === STATUS.VENCIDO },
};

export default function MemberFilterModal({ controller, filter, members, onOpenMember }) {
  const cfg = FILTERS[filter];
  if (!cfg) return null;

  const filtered = members.filter(cfg.test);

  return (
    <Modal controller={controller} width={500}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ background: cfg.color }} />
        <span className={styles.title}>{cfg.title}</span>
        <span className={styles.count}>{filtered.length} miembros</span>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.list}>
        {filtered.map((m) => {
          // En esta lista sí se distingue "Vence pronto" (badge ámbar).
          const estado = ESTADO_STYLES[m.status];
          return (
            <button key={m.id} type="button" className={styles.row} onClick={() => onOpenMember(m)}>
              <span className={styles.avatar}>{getInitials(m.nombre)}</span>
              <span className={styles.info}>
                <span className={styles.name}>{m.nombre}</span>
                <span className={styles.meta}>Vence {formatShortDate(m.fin) || '—'} · {m.tipo}</span>
              </span>
              <Badge color={estado.color} bg={estado.bg}>{estado.label}</Badge>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className={styles.empty}>Ningún miembro en esta categoría.</div>
        )}
      </div>
    </Modal>
  );
}
