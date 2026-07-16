/*
  ProgressBar — Barra de progreso horizontal.

  Se usa para: consumo de cilindros de gas, cupos de clases, origen de las
  entradas (finanzas), distribución de planes (reportes) y el avance del
  wizard de miembros.

  Recibe:
    - value: 0-100 (se recorta a ese rango por seguridad)
    - color: color o gradiente del relleno
    - height: alto en px (6 por defecto; el gas usa 9)
*/

import styles from './ProgressBar.module.css';

export default function ProgressBar({ value, color, height = 6 }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={styles.track} style={{ height }}>
      <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
