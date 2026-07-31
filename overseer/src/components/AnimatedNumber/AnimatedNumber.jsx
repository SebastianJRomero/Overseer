/*
  AnimatedNumber — Muestra un número que "cuenta" hasta su nuevo valor y da un
  pulso breve al cambiar. Lo usan los KPIs para que actualizar (p. ej. registrar
  un pago) se vea, no aparezca de golpe.

  Recibe:
    - value: número objetivo
    - format: (n) => string  — cómo mostrarlo (por defecto, entero redondeado)
*/

import { useEffect, useRef, useState } from 'react';
import useCountUp from '../../hooks/useCountUp';
import styles from './AnimatedNumber.module.css';

const defaultFormat = (n) => String(Math.round(n));

export default function AnimatedNumber({ value, format = defaultFormat }) {
  const n = useCountUp(value);
  const [pulse, setPulse] = useState(false);
  const first = useRef(true);

  // Pulso solo cuando el valor CAMBIA (no en el primer render).
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 550);
    return () => clearTimeout(t);
  }, [value]);

  return <span className={pulse ? `${styles.num} ${styles.pulse}` : styles.num}>{format(n)}</span>;
}
