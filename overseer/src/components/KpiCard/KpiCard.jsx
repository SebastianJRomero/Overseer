/*
  KpiCard — Tarjeta de indicador (KPI).

  Anatomía (idéntica al prototipo): label arriba-izquierda, icono en caja
  arriba-derecha, cifra grande en Geist Mono, texto delta debajo, una barra
  de color pegada al borde inferior y un brillo radial de fondo.

  Recibe:
    - label / value / delta: los tres textos
    - icon: nombre de <Icon/>
    - color: color del icono y de la barra inferior
    - glow: color rgba para el brillo radial de fondo (opcional)
    - onClick: si viene, la tarjeta es clicable (KPIs que abren modal)
    - numericValue / format: si se pasan, la cifra se ANIMA (cuenta hasta el
      nuevo valor con un pulso) en vez de mostrar `value` fijo. `format(n)` la
      convierte a texto (formatMoney, entero, etc.).
*/

import Icon from '../Icon/Icon';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';
import styles from './KpiCard.module.css';

export default function KpiCard({ label, value, delta, icon, color, glow, onClick, numericValue, format }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      className={clickable ? `${styles.card} ${styles.clickable}` : styles.card}
      onClick={onClick}
    >
      {/* brillo decorativo de fondo — no captura clics */}
      {glow && (
        <div
          className={styles.glow}
          style={{ background: `radial-gradient(120% 120% at 0% 0%, ${glow}, transparent 70%)` }}
        />
      )}
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.iconBox} style={{ color }}>
          <Icon name={icon} />
        </span>
      </div>
      <div className={styles.bottom}>
        <span className={styles.value}>
          {numericValue != null
            ? <AnimatedNumber value={numericValue} format={format} />
            : value}
        </span>
        {delta && <span className={styles.delta}>{delta}</span>}
      </div>
      <div className={styles.bar} style={{ background: color }} />
    </div>
  );
}
