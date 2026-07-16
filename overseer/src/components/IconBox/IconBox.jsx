/*
  IconBox — Cuadrito con un icono dentro.

  Patrón visual omnipresente en el prototipo: un cuadrado redondeado con
  fondo tenue y un glifo coloreado (cabeceras de tarjeta, filas de listas,
  KPIs). Centralizarlo evita repetir 6 propiedades CSS en cada uso.

  Recibe:
    - icon: nombre para <Icon/> (o children si se necesita algo custom)
    - color / bg: color del glifo y fondo (tokens o hex de estados)
    - size: lado en px (26 en KPIs, 34 en filas, 36 en cabeceras, 42 grande)
*/

import Icon from '../Icon/Icon';
import styles from './IconBox.module.css';

export default function IconBox({ icon, color, bg, size = 34, children }) {
  return (
    <span
      className={styles.box}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        color: color || 'var(--text-dim)',
        background: bg || 'var(--surface-2)',
      }}
    >
      {icon ? <Icon name={icon} /> : children}
    </span>
  );
}
