/*
  MemberTable — Tabla de miembros (vista escritorio).

  Contenedor con borde redondeado + scroll horizontal si no cabe (la tabla
  pide mínimo 900px, como el prototipo). La fila es responsabilidad de
  MemberRow; aquí solo cabecera y recorrido.

  ORDEN: algunas columnas son ordenables (llevan `field`). Clic en su encabezado
  ordena por ella; otro clic invierte. Solo la columna ACTIVA muestra la flecha
  (↑ ascendente · ↓ descendente). Las demás columnas son texto normal.

  Recibe:
    - members: lista YA filtrada y ordenada (por el módulo)
    - onOpen: (member) => void — abrir la ficha
    - sort: { field, dir } — orden activo
    - onSort: (field) => void — clic en un encabezado ordenable
*/

import MemberRow from './MemberRow';
import styles from './MemberTable.module.css';

/* Columnas de la tabla. Las que llevan `field` se pueden ordenar. */
const COLUMNS = [
  { label: 'Nombre', field: 'nombre' },
  { label: 'Cédula' },
  { label: 'Teléfono' },
  { label: 'Inicio' },
  { label: 'Fin', field: 'fin' },
  { label: 'Estado', field: 'estado' },
  { label: 'Membresía', field: 'tipo' },
  { label: 'Recibo', field: 'recibo' },
  { label: 'Observaciones' },
];

export default function MemberTable({ members, onOpen, sort, onSort }) {
  return (
    <div className={styles.container}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              {COLUMNS.map((col) => {
                const active = sort?.field === col.field;
                if (!col.field) return <th key={col.label} className={styles.th}>{col.label}</th>;
                return (
                  <th key={col.label} className={styles.th}>
                    <button
                      type="button"
                      className={active ? `${styles.sortBtn} ${styles.sortActive}` : styles.sortBtn}
                      onClick={() => onSort(col.field)}
                    >
                      {col.label}
                      {active && (
                        <span className={styles.arrow}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                );
              })}
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
