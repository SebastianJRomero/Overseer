/*
  charts/chartPaths.js — Construye paths SVG de línea y área (sin librerías).

  Convierte una serie de valores en las coordenadas de un viewBox: la línea
  (path "M..L..") y el área bajo ella (cerrada al piso). Reutilizado por el
  sparkline del widget y por el gráfico grande del modal de historial.
  Es la misma matemática del prototipo, aislada y comentada.
*/

/**
 * @param {number[]} values  serie a dibujar
 * @param {object} box  { w, h, padX, padTop, padBot } dimensiones del viewBox
 * @param {number} lo  valor mínimo del eje Y
 * @param {number} hi  valor máximo del eje Y
 * @returns {{ line: string, area: string, points: {x,y}[] }}
 */
export function buildPaths(values, box, lo, hi) {
  const { w, h, padX, padTop, padBot } = box;
  const n = values.length;
  // Sin datos no hay path que construir (evita acceder a xs[-1] y romper).
  if (n === 0) return { line: '', area: '', points: [] };
  const range = (hi - lo) || 1;
  // X repartido uniformemente; Y invertido (0 arriba) y escalado al rango.
  const xs = values.map((v, i) => (n > 1 ? padX + (i * (w - 2 * padX)) / (n - 1) : w / 2));
  const ys = values.map((v) => padTop + (1 - (v - lo) / range) * (h - padTop - padBot));

  const line = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${line} L${xs[n - 1].toFixed(1)} ${(h - padBot).toFixed(1)} L${xs[0].toFixed(1)} ${(h - padBot).toFixed(1)} Z`;
  return { line, area, points: xs.map((x, i) => ({ x: +x.toFixed(1), y: +ys[i].toFixed(1) })) };
}
