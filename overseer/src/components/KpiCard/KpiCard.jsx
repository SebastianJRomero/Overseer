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
*/

import Icon from '../Icon/Icon';
import styles from './KpiCard.module.css';

export default function KpiCard({ label, value, delta, icon, color, glow, onClick }) {
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
        <span className={styles.value}>{value}</span>
        {delta && <span className={styles.delta}>{delta}</span>}
      </div>
      <div className={styles.bar} style={{ background: color }} />
    </div>
  );
}
