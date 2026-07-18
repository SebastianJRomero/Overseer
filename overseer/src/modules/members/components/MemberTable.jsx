/*
  MemberTable — Tabla de miembros (vista escritorio).

  Contenedor con borde redondeado + scroll horizontal si no cabe (la tabla
  pide mínimo 900px, como el prototipo). La fila es responsabilidad de
  MemberRow; aquí solo cabecera y recorrido.

  Recibe:
    - members: lista YA filtrada (búsqueda aplicada por el módulo)
    - onOpen: (member) => void — abrir la ficha
*/

import MemberRow from './MemberRow';
import styles from './MemberTable.module.css';

const COLUMNS = ['Nombre', 'Cédula', 'Teléfono', 'Inicio', 'Fin', 'Estado', 'Membresía', 'Recibo', 'Observaciones'];

export default function MemberTable({ members, onOpen }) {
  return (
    <div className={styles.container}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              {COLUMNS.map((col) => (
                <th key={col} className={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} onOpen={() => onOpen(m)} />
            ))}
          </tbody>
        </table>
      </div>
      {members.length === 0 && (
        <div className={styles.empty}>Ningún miembro coincide con la búsqueda.</div>
      )}
    </div>
  );
}
