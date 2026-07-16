/*
  lib/seededRandom.js — Generador pseudoaleatorio DETERMINISTA.

  ¿Por qué no Math.random()? El mock de Finanzas genera movimientos de demo
  por mes, y necesitamos que el MISMO mes muestre SIEMPRE los mismos datos
  (si navegas a junio, sales y vuelves, junio no puede cambiar). Un PRNG con
  semilla fija por (año, mes) garantiza eso. Es el mismo LCG del prototipo.

  Esto vive solo en la capa mock — desaparece cuando llegue la API real.
*/

/**
 * Crea una función rnd() que devuelve números en [0, 1) de forma
 * reproducible: misma semilla → misma secuencia.
 * @param {number} seed cualquier entero (p. ej. año*12 + mes)
 * @returns {() => number}
 */
export function createSeededRandom(seed) {
  // Multiplicador de Knuth para dispersar semillas parecidas (jun vs jul).
  let state = (seed * 2654435761) % 2147483647;
  return function rnd() {
    // LCG clásico: state avanza de forma determinista en cada llamada.
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
