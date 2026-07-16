/*
  Badge — Píldora de estado (dot opcional + texto).

  Se usa para TODOS los estados coloreados del sistema: Vigente/Vencido,
  En stock/Bajo/Agotado, Operativo/Mantenimiento, Pendiente, roles, planes…

  Recibe:
    - color / bg: pareja de colores del estado (p. ej. var(--ok) / var(--ok-bg))
    - dot: color del puntito; si no se pasa, no se dibuja
    - onClick / title: opcionales (algunos badges son clicables, como el
      Activo/Oculto de los planes)
*/

import styles from './Badge.module.css';

export default function Badge({ color, bg, dot, onClick, title, children }) {
  const clickable = typeof onClick === 'function';
  return (
    <span
      className={clickable ? `${styles.badge} ${styles.clickable}` : styles.badge}
      style={{ color, background: bg }}
      onClick={onClick}
      title={title}
    >
      {dot && <span className={styles.dot} style={{ background: dot }} />}
      {children}
    </span>
  );
}
