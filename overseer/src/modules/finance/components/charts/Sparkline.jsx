/*
  Sparkline — Mini gráfico de línea (el "neto" de los últimos 6 meses).

  Va dentro del widget "Historial de finanzas" de la fila de KPIs. Sin ejes
  ni etiquetas: solo la tendencia. Escala con un pequeño margen para que la
  línea no toque los bordes.

  Recibe:
    - values: number[] (el neto de cada mes)
    - color: color de la línea (por defecto azul del widget)
*/

import { buildPaths } from './chartPaths';
import styles from './Sparkline.module.css';

const BOX = { w: 300, h: 60, padX: 10, padTop: 12, padBot: 12 };

export default function Sparkline({ values, color = '#7fc9ff' }) {
  // Necesitamos al menos 2 puntos para trazar una línea; mientras los datos
  // cargan (history vacío) mostramos un lienzo vacío en vez de romper.
  if (!values || values.length < 2) {
    return <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} preserveAspectRatio="none" className={styles.svg} />;
  }
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo) * 0.28 || 1; // margen para que no roce los bordes
  const { line, area } = buildPaths(values, BOX, lo - pad, hi + pad);

  return (
    <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} preserveAspectRatio="none" className={styles.svg}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.38" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
