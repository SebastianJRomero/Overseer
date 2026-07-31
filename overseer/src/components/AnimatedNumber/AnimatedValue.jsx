/*
  AnimatedValue — Anima la CIFRA de un valor que puede venir como string con
  prefijo/sufijo ("$ 95.000", "63 restantes", "77%", "8") o como número.

  Extrae el primer número (con separadores de miles), lo anima con AnimatedNumber
  y lo vuelve a formatear (es-CO) conservando el texto de alrededor. Si el valor
  no tiene número, se muestra tal cual. Sirve para las mini-tarjetas (Inventario,
  Reportes, Clases, Entrenadores) sin cambiar cómo las arma cada módulo.
*/

import AnimatedNumber from './AnimatedNumber';

const nf = new Intl.NumberFormat('es-CO');

export default function AnimatedValue({ value }) {
  if (typeof value === 'number') {
    return <AnimatedNumber value={value} format={(n) => nf.format(Math.round(n))} />;
  }

  const s = String(value ?? '');
  const m = s.match(/[\d.]*\d/); // primer número (dígitos + puntos de miles)
  if (!m) return <>{s}</>;

  const raw = m[0];
  const num = Number(raw.replace(/\./g, '')); // quita puntos de miles
  if (Number.isNaN(num)) return <>{s}</>;

  const prefix = s.slice(0, m.index);
  const suffix = s.slice(m.index + raw.length);

  // Guarda: si justo tras el número viene una LETRA pegada (magnitud abreviada
  // como "8.4M" o "12K"), no animamos — el "." sería decimal, no de miles, y lo
  // romperíamos. Se muestra tal cual (esas cifras de demo no cambian).
  if (/^[a-zA-Z]/.test(suffix)) return <>{s}</>;

  const fmt = (n) => prefix + nf.format(Math.round(n)) + suffix;
  return <AnimatedNumber value={num} format={fmt} />;
}
