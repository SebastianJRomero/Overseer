/*
  SettingsCard — Caja con cabecera (título + subtítulo opcional + acción) y
  cuerpo, que comparten todas las secciones de Ajustes.

  Recibe:
    - title: título de la tarjeta
    - subtitle: línea gris opcional bajo el título
    - action: nodo opcional a la derecha de la cabecera (p. ej. "＋ Nuevo…")
    - children: filas/contenido de la tarjeta
*/

import styles from './SettingsShared.module.css';

export default function SettingsCard({ title, subtitle, action, children }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeading}>
          <span className={styles.cardTitle}>{title}</span>
          {subtitle && <span className={styles.cardSubtitle}>{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
