/*
  lib/seededRandom.js — PRNG determinista (backend).

  Réplica exacta del LCG del front. El generador de movimientos demo de
  Finanzas necesita que el MISMO mes muestre SIEMPRE los mismos datos, así que
  la semilla es fija por (año, mes). Con el backend seguimos generando esos
  movimientos de ejemplo del lado del servidor para MANTENER LA PARIDAD con el
  mock (mismo comportamiento que hoy). En el Tramo B, cuando exista el libro
  mayor real, este generador desaparece.
*/

/**
 * misma semilla → misma secuencia de números en [0, 1).
 * @param {number} seed  entero (p. ej. año*12 + mes)
 * @returns {() => number}
 */
export function createSeededRandom(seed) {
  let state = (seed * 2654435761) % 2147483647;
  return function rnd() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
