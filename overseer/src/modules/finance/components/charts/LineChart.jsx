/*
  LineChart — Gráfico de líneas de Ingresos vs Egresos (6 meses).

  SVG hecho a mano (sin librerías): rejilla horizontal con etiquetas de
  dinero, dos series (entradas azul, salidas plata) con su área tenue,
  puntos con su valor, y los meses en el eje X. Escala proporcional
  (preserveAspectRatio por defecto) para que el texto no se deforme.

  Recibe:
    - history: [[mes, ingresos, egresos], …] (6 meses)
*/

import { formatMoneyShort } from '../../../../lib/money';
import { buildPaths } from './chartPaths';
import styles from './LineChart.module.css';

/* Colores de las series por token del historial (coherentes en claro y oscuro):
   entradas = azul del historial, salidas = naranja de egresos (cercano al acento). */
const INCOME_COLOR = 'var(--hist-info)';
const EXPENSE_COLOR = 'var(--egreso)';
/* Fondo/anillo de los puntos = panel del historial (claro en claro, oscuro en oscuro). */
const DOT_CONTRAST = 'var(--hist-panel)';
const BOX = { w: 760, h: 240, padX: 88, padTop: 18, padBot: 26 };
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

export default function LineChart({ history }) {
  const months = history.map((h) => h[0]);
  const income = history.map((h) => h[1]);
  const expense = history.map((h) => h[2]);
  const max = Math.max(...income, ...expense, 1) * 1.08;

  const inc = buildPaths(income, BOX, 0, max);
  const exp = buildPaths(expense, BOX, 0, max);

  // Líneas de rejilla + etiqueta de dinero a la izquierda.
  const grid = GRID_FRACTIONS.map((f) => ({
    y: BOX.padTop + f * (BOX.h - BOX.padTop - BOX.padBot),
    label: formatMoneyShort(max * (1 - f)),
  }));

  return (
    <svg viewBox={`0 0 ${BOX.w} ${BOX.h + 26}`} className={styles.svg}>
      <defs>
        <linearGradient id="incFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INCOME_COLOR} stopOpacity="0.34" />
          <stop offset="1" stopColor={INCOME_COLOR} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EXPENSE_COLOR} stopOpacity="0.26" />
          <stop offset="1" stopColor={EXPENSE_COLOR} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rejilla + etiquetas del eje Y */}
      {grid.map((g, i) => (
        <g key={i}>
          <line x1={BOX.padX} x2={BOX.w} y1={g.y} y2={g.y} className={styles.gridLine} />
          <text x={BOX.padX - 36} y={g.y - 3} className={styles.axisLabel}>{g.label}</text>
        </g>
      ))}

      {/* Áreas (salidas debajo, entradas encima) */}
      <path d={exp.area} fill="url(#expFill)" />
      <path d={inc.area} fill="url(#incFill)" />

      {/* Líneas */}
      <path d={exp.line} fill="none" stroke={EXPENSE_COLOR} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={inc.line} fill="none" stroke={INCOME_COLOR} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      {/* Puntos + valores */}
      {exp.points.map((p, i) => (
        <g key={`e${i}`}>
          <circle cx={p.x} cy={p.y} r="4" fill={DOT_CONTRAST} stroke={EXPENSE_COLOR} strokeWidth="2.4" />
          <text x={p.x} y={p.y + 15} className={styles.expLabel}>{formatMoneyShort(expense[i])}</text>
        </g>
      ))}
      {inc.points.map((p, i) => (
        <g key={`i${i}`}>
          <circle cx={p.x} cy={p.y} r="4.4" fill={INCOME_COLOR} stroke={DOT_CONTRAST} strokeWidth="2.4" />
          <text x={p.x} y={p.y - 10} className={styles.incLabel}>{formatMoneyShort(income[i])}</text>
        </g>
      ))}

      {/* Meses (eje X) */}
      {inc.points.map((p, i) => (
        <text key={`m${i}`} x={p.x} y={BOX.h + 12} className={styles.monthLabel}>{months[i]}</text>
      ))}
    </svg>
  );
}
