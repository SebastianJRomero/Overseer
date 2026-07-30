/*
  lib/seededRandom.js — PRNG determinista (backend).

  Réplica exacta del LCG del front. Lo usa el SEED del libro mayor para generar
  un histórico de movimientos estable: misma semilla por (año, mes) → los mismos
  asientos de ejemplo cada vez que se resiembra la BD. A diferencia del Tramo A,
  ya no se calcula al vuelo: estos asientos se PERSISTEN como filas reales del
  libro (fuente única de verdad).
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
