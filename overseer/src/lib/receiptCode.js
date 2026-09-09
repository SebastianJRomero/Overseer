/*
  lib/receiptCode.js — Código verificador del recibo (espejo del backend).

  Misma fórmula que server/src/routes/receipts.js `codigoFor`: djb2 sobre
  `${numero}|${memberId}|overseer-recibo`, en base36 de 6 chars. Es
  determinista a propósito: el front lo muestra al instante sin un fetch
  extra y el backend lo confirma en GET /receipts/:numero. NO es un secreto
  criptográfico, solo evita consecutivos inventados al azar.
*/

/**
 * @param {string} numero  p. ej. 'RC-1056'
 * @param {string} [memberId]
 * @returns {string} código de 6 caracteres
 */
export function receiptCode(numero, memberId = '') {
  const s = `${numero}|${memberId}|overseer-recibo`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}
