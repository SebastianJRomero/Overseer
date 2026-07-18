/*
  MemberRow — Una fila de la tabla de miembros.

  Pinta los 9 campos del prototipo. Detalles fieles:
    - avatar con iniciales + nombre que se tiñe de coral al pasar el mouse,
    - "Fin" en ámbar cuando vence pronto (aviso sutil en la propia fecha),
    - estado como badge con punto (en tabla, 'pronto' se muestra "Vigente":
      el aviso de vencimiento va en la fecha; así lo hace el prototipo),
    - plan como badge con su color propio.

  Toda la fila abre la ficha (onOpen) — es la acción principal.
*/

import Badge from '../../../components/Badge/Badge';
import { getInitials } from '../../../lib/initials';
import { formatCedula, formatPhone } from '../../../lib/format';
import { STATUS } from '../../../lib/memberStatus';
import { ESTADO_STYLES, getPlanStyle } from '../memberStyles';
import styles from './MemberTable.module.css';

export default function MemberRow({ member, onOpen }) {
  const vencido = member.status === STATUS.VENCIDO;
  // En la tabla solo hay dos badges: Vigente (verde) o Vencido (coral).
  const estado = vencido ? ESTADO_STYLES[STATUS.VENCIDO] : ESTADO_STYLES[STATUS.VIGENTE];
  const estadoLabel = vencido ? 'Vencido' : 'Vigente';
  const plan = getPlanStyle(member.tipo);

  return (
    <tr className={styles.row} onClick={onOpen} title="Ver detalle">
      <td className={styles.cell}>
        <div className={styles.nameCell}>
          <span className={styles.avatar}>{getInitials(member.nombre)}</span>
          <span className={styles.name}>{member.nombre}</span>
        </div>
      </td>
      <td className={`${styles.cell} ${styles.mono}`}>{formatCedula(member.cedula)}</td>
      <td className={`${styles.cell} ${styles.mono}`}>{formatPhone(member.telefono)}</td>
      <td className={`${styles.cell} ${styles.soft}`}>{member.inicio}</td>
      <td
        className={styles.cell}
        // La fecha avisa: ámbar si vence pronto, gris normal si no.
        style={{ color: member.status === STATUS.PRONTO ? 'var(--warn)' : 'var(--text-soft)' }}
      >
        {member.fin || '—'}
      </td>
      <td className={styles.cell}>
        <Badge color={estado.color} bg={estado.bg} dot={estado.dot}>{estadoLabel}</Badge>
      </td>
      <td className={styles.cell}>
        <Badge color={plan.color} bg={plan.bg}>{member.tipo}</Badge>
      </td>
      <td className={`${styles.cell} ${styles.mono}`}>{member.recibo}</td>
      <td className={`${styles.cell} ${styles.obs}`}>{member.obs}</td>
    </tr>
  );
}
