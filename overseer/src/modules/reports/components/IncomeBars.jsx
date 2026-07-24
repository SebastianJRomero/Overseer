/*
  IncomeBars — Gráfico de barras de ingresos mensuales (panel de Reportes).

  Barras a mano (sin librería): la altura de cada una es relativa al mes con
  más ingreso; el último mes (actual) se resalta con el gradiente de acento.

  Recibe:
    - months: [{ mes, valor }]  valor en millones
*/

import styles from './IncomeBars.module.css';

export default function IncomeBars({ months }) {
  const max = Math.max(...months.map((m) => m.valor), 1);

  return (
    <div className={styles.panel}>
      <span className={styles.title}>Ingresos mensuales</span>
      <div className={styles.bars}>
        {months.map((m, i) => {
          const last = i === months.length - 1;
          return (
            <div key={m.mes} className={styles.col}>
              <span className={styles.value} style={{ color: last ? 'var(--acc-1)' : 'var(--text-dim)' }}>
                $ {m.valor.toFixed(1)}M
              </span>
              <div
                className={styles.bar}
                style={{ height: `${Math.round((m.valor / max) * 100)}%`, background: last ? 'var(--acc-grad)' : '#1e2740' }}
              />
              <span className={styles.mes}>{m.mes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
