/*
  lib/receiptCanvas.js — Dibuja el recibo digital en un <canvas> (API nativa).

  Por qué canvas a mano y no html2canvas: la política del proyecto prohíbe
  librerías externas sin aprobación (§7). Canvas2D dibuja el comprobante
  idéntico al modal y exporta PNG para WhatsApp con `toBlob`.

  Paleta = tokens de theme.css (fondo tarjeta, bordes, acento de marca).
*/

import { formatMoney } from './money';
import { formatShortDate } from './date';

/** Carga una data URL como imagen (para pintar el QR). */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Dibuja el recibo y devuelve el canvas (1080×1520, listo para PNG).
 * @param {{ gym, member, recibo, qrDataUrl }} d
 * @param {string} d.gym  nombre del gimnasio
 * @param {object} d.member  { nombre, tipo, valor, inicio, fin, medio_pago }
 * @param {object} d.recibo  { numero, codigo, fecha }
 */
export async function drawReceiptCanvas({ gym, member, recibo, qrDataUrl }) {
  const W = 1080;
  const H = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');

  // Fondo + marco (tokens dark).
  c.fillStyle = '#0e121b';
  c.fillRect(0, 0, W, H);
  c.strokeStyle = '#1c2334';
  c.lineWidth = 3;
  const M = 48;
  c.beginPath();
  c.roundRect(M, M, W - M * 2, H - M * 2, 40);
  c.fillStyle = '#12161f';
  c.fill();
  c.stroke();

  const cx = W / 2;
  let y = 170;
  c.textAlign = 'center';

  // Marca + gimnasio.
  c.fillStyle = '#EC3013';
  c.beginPath();
  c.arc(cx, y, 58, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#fff';
  c.font = '700 64px Archivo, system-ui, sans-serif';
  c.fillText('O', cx, y + 23);
  y += 105;
  c.fillStyle = '#eef1f6';
  c.font = '700 44px Archivo, system-ui, sans-serif';
  c.fillText(gym || 'OVERSEER Fitness Club', cx, y);
  y += 52;
  c.fillStyle = '#5c6a82';
  c.font = '600 24px Archivo, system-ui, sans-serif';
  c.fillText('RECIBO DIGITAL DE PAGO', cx, y);

  // Número del recibo.
  y += 92;
  c.fillStyle = '#7ee2a0';
  c.font = '700 72px "Geist Mono", monospace';
  c.fillText(recibo.numero, cx, y);
  y += 48;
  c.fillStyle = '#5c6a82';
  c.font = '500 26px "Geist Mono", monospace';
  c.fillText(`Código: ${recibo.codigo} · ${formatShortDate(recibo.fecha)}`, cx, y);

  // Filas de datos (fechas legibles: "9 Sep 2026", igual que el modal).
  const rows = [
    ['Miembro', member.nombre],
    ['Plan', `${member.tipo} · ${formatShortDate(member.inicio)} → ${formatShortDate(member.fin)}`],
    ['Medio de pago', member.medio_pago === 'nequi' ? 'Nequi' : 'Efectivo'],
    ['Valor pagado', formatMoney(member.valor)],
  ];
  y += 70;
  c.textAlign = 'left';
  rows.forEach(([k, v], i) => {
    const ry = y + i * 96;
    c.fillStyle = '#5c6a82';
    c.font = '600 24px Archivo, system-ui, sans-serif';
    c.fillText(k.toUpperCase(), 140, ry);
    c.fillStyle = k === 'Valor pagado' ? '#7ee2a0' : '#eef1f6';
    c.font = `${k === 'Valor pagado' ? '700' : '600'} 36px Archivo, system-ui, sans-serif`;
    c.fillText(String(v ?? '—').slice(0, 42), 140, ry + 44);
    if (i < rows.length - 1) {
      c.strokeStyle = '#161c28';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(140, ry + 66);
      c.lineTo(W - 140, ry + 66);
      c.stroke();
    }
  });

  // QR + nota de validación.
  try {
    const qr = await loadImage(qrDataUrl);
    const qs = 300;
    c.drawImage(qr, cx - qs / 2, y + rows.length * 96 - 20, qs, qs);
  } catch {
    // Sin QR (offline extremo): el código de texto sigue validando.
  }
  c.textAlign = 'center';
  c.fillStyle = '#5c6a82';
  c.font = '500 24px Archivo, system-ui, sans-serif';
  c.fillText('Escanea para validar · presenta este recibo en recepción', cx, H - 130);

  return canvas;
}
