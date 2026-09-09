/*
  services/receiptsService.js — Recibo digital (API real: Node + Express + SQLite).

  Contrato que consume la UI (vía hooks, nunca directo desde componentes):
    peekNext()          → Promise<{ numero }>  (previsualiza sin consumir)
    getReceipt(numero)  → Promise<datos mínimos> (validación del QR)

  El número se CONSUME en el backend al crear/renovar (members.js lo asigna
  en transacción cuando el recibo digital está activo), así que aquí no hay
  "issue" desde el front: el wizard solo previsualiza y el modal muestra lo
  que devolvió el guardado.
*/

import { apiGet } from './api';

/** Previsualiza el siguiente consecutivo sin consumirlo. */
export async function peekNext() {
  return apiGet('/receipts/next');
}

/**
 * Datos mínimos de un recibo para validar el QR.
 * @param {string} numero  p. ej. 'RC-1056'
 */
export async function getReceipt(numero) {
  return apiGet(`/receipts/${encodeURIComponent(numero)}`);
}
