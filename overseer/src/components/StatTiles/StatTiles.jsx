/*
  StatTiles — Rejilla de mini-indicadores (label + cifra en mono, con delta
  opcional).

  Distinto del KpiCard grande: aquí las tarjetas son pequeñas, sin icono. Lo
  usan los módulos opcionales (Clases, Entrenadores, Reportes). Si un item
  trae `delta`, se pinta una píldora verde (subida) o coral (bajada) junto a
  la cifra — para los KPIs de Reportes.

  Recibe:
    - items: [{ label, value, color?, delta?, deltaUp? }]
    - minWidth: ancho mínimo de cada tarjeta en px (auto-fit), 150 por defecto
*/

import styles from './StatTiles.module.css';

export default function StatTiles({ items, minWidth = 150 }) {
  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))` }}
    >
      {items.map((k) => (
        <div key={k.label} className={styles.tile}>
          <span className={styles.label}>{k.label}</span>
          <div className={styles.valueRow}>
            <span className={styles.value} style={{ color: k.color || 'var(--text-strong)' }}>{k.value}</span>
            {k.delta && (
              <span
                className={styles.delta}
                style={k.deltaUp
                  ? { color: 'var(--ok)', background: 'var(--ok-bg)' }
                  : { color: 'var(--danger)', background: 'var(--danger-bg)' }}
              >
                {k.delta}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
