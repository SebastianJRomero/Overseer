/*
  lib/csv.js — Exportar datos a CSV y disparar la descarga en el navegador.

  Se usa en Ajustes → Respaldos y datos. Genera el CSV en el cliente (no hay
  backend todavía) a partir de una lista de filas ya preparadas: cabeceras +
  filas de valores. El separador es ";" (Excel es-CO lo abre en columnas) y
  se antepone un BOM para que las tildes se vean bien.
*/

/** Escapa un valor para CSV: comillas si trae separador, comillas o saltos. */
function escapeCell(value) {
  const s = value == null ? '' : String(value);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Construye el texto CSV.
 * @param {string[]} headers  nombres de columna
 * @param {Array<Array>} rows filas (cada una un array de celdas)
 * @returns {string}
 */
export function toCsv(headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(';'));
  return lines.join('\r\n');
}

/**
 * Dispara la descarga de un CSV en el navegador.
 * @param {string} filename  nombre del archivo (con .csv)
 * @param {string} csv       contenido ya formateado (toCsv)
 */
export function downloadCsv(filename, csv) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
