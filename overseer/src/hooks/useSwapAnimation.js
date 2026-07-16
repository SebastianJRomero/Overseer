/*
  hooks/useSwapAnimation.js — Re-dispara una animación CSS al cambiar de vista.

  Problema: si un nodo ya tiene `animation: swapA ...` y cambias su contenido,
  el navegador NO vuelve a reproducir la animación (el nombre no cambió).
  Truco del prototipo: tener dos keyframes idénticos (swapA/swapB) y alternar
  entre ellos cada vez que cambia la "clave" de la vista (el tab activo, la
  sub-sección...). El cambio de nombre obliga al navegador a re-animar.

  Uso:
    const anim = useSwapAnimation(activeTab, ['swapA', 'swapB']);
    <div style={{ animation: anim }}>...</div>
*/

import { useRef } from 'react';

/**
 * @param {*} key                cuando cambia, se alterna la animación
 * @param {[string, string]} kf  par de keyframes idénticos, p. ej. ['swapA','swapB']
 * @param {string} [duration]    duración CSS, por defecto la del prototipo
 * @returns {string} valor listo para la propiedad CSS `animation`
 */
export default function useSwapAnimation(key, kf, duration = '.34s') {
  // useRef y no useState: alternar no debe provocar un render extra,
  // solo recordar en cuál de las dos animaciones vamos.
  const ref = useRef({ lastKey: key, flip: 0 });

  if (ref.current.lastKey !== key) {
    ref.current.lastKey = key;
    ref.current.flip = (ref.current.flip + 1) % 2;
  }

  return `${kf[ref.current.flip]} ${duration} cubic-bezier(.2,.8,.3,1) both`;
}
