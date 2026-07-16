/*
  EmptyState — Mensaje centrado para listas vacías.

  "Sin movimientos este día...", "Ningún miembro en esta categoría."…
  Un solo lugar para el estilo del texto gris centrado.
*/

import styles from './EmptyState.module.css';

export default function EmptyState({ children }) {
  return <div className={styles.empty}>{children}</div>;
}
