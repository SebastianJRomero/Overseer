/*
  Avatar — Círculo/cuadrado con las iniciales de una persona.

  Recibe:
    - name: nombre completo (las iniciales se calculan con lib/initials)
    - size: lado en px (28 tabla, 30 topbar, 34 listas, 40 menú de usuario)
    - accent: true → fondo con el gradiente de marca (avatar del usuario
      logueado); false → fondo neutro (miembros, cuentas).
*/

import { getInitials } from '../../lib/initials';
import styles from './Avatar.module.css';

export default function Avatar({ name, size = 34, accent = false }) {
  return (
    <span
      className={accent ? styles.accent : styles.neutral}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
