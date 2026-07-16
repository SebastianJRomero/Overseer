/*
  hooks/useClock.js — Hora y fecha en vivo para la TopBar.

  Devuelve { time: "3:45 PM", date: "MIÉ 16 JUL" } y se actualiza cada 15 s
  (mismo intervalo del prototipo: suficiente para un reloj sin segundos y
  barato para el render).
*/

import { useEffect, useState } from 'react';
import { DAY_ABBR_UP, MONTH_ABBR_UP, pad2 } from '../lib/date';

/** Calcula las dos etiquetas del reloj a partir de un Date. */
function clockParts(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12; // las 00:xx se muestran como 12:xx AM
  return {
    time: `${h}:${pad2(d.getMinutes())} ${ampm}`,
    date: `${DAY_ABBR_UP[d.getDay()]} ${d.getDate()} ${MONTH_ABBR_UP[d.getMonth()]}`,
  };
}

export default function useClock() {
  const [parts, setParts] = useState(() => clockParts(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setParts(clockParts(new Date())), 15000);
    return () => clearInterval(timer); // limpiar al desmontar la TopBar
  }, []);

  return parts;
}
