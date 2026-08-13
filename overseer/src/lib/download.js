/*
  lib/download.js — Dispara la descarga de un Blob en el navegador.

  Sirve para cualquier archivo generado en el cliente (CSV, JSON, respaldos
  .db). Reutiliza el patrón de lib/csv.js (object URL + ancla) en un helper
  único para no duplicarlo. Funciona igual en la web y en Electron (el
  Chromium de la app descarga a la carpeta de descargas del sistema).
*/

/**
 * Descarga un Blob como archivo.
 * @param {string} filename  nombre con el que se guarda (p. ej. 'respaldo.db')
 * @param {Blob} blob        contenido binario
 */
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
