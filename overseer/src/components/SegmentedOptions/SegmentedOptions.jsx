/*
  SegmentedOptions — Grid de opciones excluyentes (pastillas seleccionables).

  Patrón que el prototipo repite en 7 sitios: estado de equipo, categoría de
  producto, tipo de evento, plan de membresía, destino/servicio de gas, rol
  de usuario. La opción activa se pinta con SU color de estado; las demás
  quedan en gris neutro.

  Recibe:
    - options: [{ value, label, color?, bg?, dot? }]
        color/bg: pareja de estado para cuando esté activa
        (si no vienen, la activa usa el gradiente de acento — caso "planes")
    - value: la opción seleccionada
    - onChange: (value) => void
    - columns: nº de columnas del grid; sin columns → fila flexible (wrap)
*/

import styles from './SegmentedOptions.module.css';

export default function SegmentedOptions({ options, value, onChange, columns }) {
  const layoutStyle = columns
    ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }
    : undefined;

  return (
    <div className={columns ? styles.grid : styles.row} style={layoutStyle}>
      {options.map((opt) => {
        const on = opt.value === value;
        // Con colores propios → estilo de estado; sin ellos → acento de marca.
        const style = on
          ? opt.color
            ? { background: opt.bg, borderColor: opt.color, color: opt.color }
            : { background: 'var(--acc-grad)', borderColor: 'transparent', color: '#fff' }
          : undefined;
        return (
          <button
            key={opt.value}
            type="button"
            className={styles.option}
            style={style}
            onClick={() => onChange(opt.value)}
          >
            {opt.dot && (
              <span className={styles.dot} style={{ background: opt.dot }} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
