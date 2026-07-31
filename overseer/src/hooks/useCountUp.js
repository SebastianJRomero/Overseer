/*
  useCountUp — Anima un número desde su valor anterior hasta el nuevo.

  Cuando `target` cambia, interpola (easeOutCubic) durante `duration` ms con
  requestAnimationFrame y devuelve el valor intermedio en cada frame. El que
  consume decide cómo formatearlo (formatMoney, redondeo, etc.).

  No usa librerías (regla del proyecto). Respeta "prefiere menos animación":
  si el sistema pide reducir movimiento, salta directo al valor final.
*/

import { useEffect, useRef, useState } from 'react';

export default function useCountUp(target, duration = 500) {
  const [display, setDisplay] = useState(Number(target) || 0);
  const displayRef = useRef(display);
  displayRef.current = display;
  const rafRef = useRef(0);

  useEffect(() => {
    const to = Number(target);
    if (Number.isNaN(to)) return undefined;
    const from = displayRef.current;
    if (from === to) return undefined;

    // Accesibilidad: sin animación si el usuario la reduce.
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisplay(to); return undefined; }

    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3; // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else setDisplay(to);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}
