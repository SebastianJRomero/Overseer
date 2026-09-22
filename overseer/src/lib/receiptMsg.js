/*
  lib/receiptMsg.js — Plantillas del mensaje de recibo (Ajustes → Recibo digital).

  Variables disponibles: {nombre} {numero} {plan} {valor} {codigo} {gym}
  {inicio} {fin}. El reemplazo es texto plano (sin evaluar código) para que
  el admin edite libremente sin riesgo.
*/

import { formatMoney } from './money';
import { formatShortDate } from './date';

export const DEFAULT_WHATSAPP_MSG =
  'Hola {nombre}, tu recibo {numero} ({plan}) por {valor} fue registrado en {gym}. Código: {codigo}.';
export const DEFAULT_PIE_MSG = 'Escanea para validar · presenta este recibo en recepción';

/**
 * Rellena la plantilla con los datos del recibo.
 * @param {string} tpl
 * @param {{gym, member, recibo}} d
 * @returns {string}
 */
export function renderReceiptMsg(tpl, { gym, member, recibo }) {
  const vars = {
    nombre: member?.nombre ?? '',
    numero: recibo?.numero ?? '',
    plan: member?.tipo ?? '',
    valor: formatMoney(member?.valor),
    codigo: recibo?.codigo ?? '',
    gym: gym ?? '',
    inicio: formatShortDate(member?.inicio),
    fin: formatShortDate(member?.fin),
  };
  return String(tpl || '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
