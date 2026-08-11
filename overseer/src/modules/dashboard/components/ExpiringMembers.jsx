/*
  ExpiringMembers — Widget "Próximos vencimientos" (columna derecha).

  Lista los miembros que hay que atender: primero los VENCIDOS y luego los
  que vencen dentro de 7 días. La regla no se recalcula aquí — llega ya
  derivada en `member.status` (lib/memberStatus, vía useMembers).

  Un clic en una fila abre la ficha de ese miembro en el módulo Miembros
  (navegación con params: el Inicio no monta modales ajenos).

  Recibe:
    - members: lista completa CON status
    - onOpenMember: (member) => void
*/

import Badge from '../../../components/Badge/Badge';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { getInitials } from '../../../lib/initials';
import { formatShortDate } from '../../../lib/date';
import { STATUS } from '../../../lib/memberStatus';
import { ESTADO_STYLES } from '../../members/memberStyles';
import styles from './SideWidget.module.css';

export default function ExpiringMembers({ members, onOpenMember }) {
  // Vencidos primero (son los urgentes), luego los que vencen pronto.
  const pendientes = members
    .filter((m) => m.status !== STATUS.VIGENTE)
    .sort((a, b) => (a.status === STATUS.VENCIDO ? -1 : 0) - (b.status === STATUS.VENCIDO ? -1 : 0));

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Próximos vencimientos</span>
        <span className={styles.count}>{pendientes.length} por atender</span>
      </div>

      {pendientes.length > 0 ? (
        <div className={styles.list}>
          {pendientes.map((m) => {
            const estado = ESTADO_STYLES[m.status];
            return (
              <button key={m.id} type="button" className={styles.row} onClick={() => onOpenMember(m)}>
                <span className={styles.avatar}>{getInitials(m.nombre)}</span>
                <span className={styles.info}>
                  <span className={styles.name}>{m.nombre}</span>
                  <span className={styles.meta}>Vence {formatShortDate(m.fin)} · {m.tipo}</span>
                </span>
                <Badge color={estado.color} bg={estado.bg}>{estado.label}</Badge>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState>Sin vencimientos próximos. Todo al día.</EmptyState>
      )}
    </div>
  );
}
