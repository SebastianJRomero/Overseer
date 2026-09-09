/*
  lib/desktop.js — Puente opcional con la app de escritorio (Electron).

  El preload de Electron expone `window.overseer.openReceiptsFolder()`; en la
  web ese objeto NO existe y todo es no-op con fallback (false). Así el mismo
  front funciona en ambos sin condicionales regados: quien llama decide qué
  mostrar según `isDesktop()`.
*/

/** ¿Corremos dentro de la app de escritorio (con puente preload)? */
export function isDesktop() {
  return typeof window !== 'undefined' && !!window.overseer?.openReceiptsFolder;
}

/**
 * Abre la carpeta de recibos (la elegida o la de la app). Solo escritorio.
 * @param {string} [dir]  carpeta elegida en Ajustes ('' = la de la app)
 * @returns {Promise<boolean>} true si se abrió
 */
export async function openReceiptsFolder(dir) {
  try {
    if (!isDesktop()) return false;
    await window.overseer.openReceiptsFolder(dir || '');
    return true;
  } catch {
    return false;
  }
}

/** Carpeta por defecto de la app (%APPDATA%\OVERSEER\recibos). Solo escritorio. */
export async function defaultReceiptsDir() {
  try {
    if (!isDesktop()) return '';
    return (await window.overseer.defaultReceiptsDir()) || '';
  } catch {
    return '';
  }
}

/**
 * Selector de carpeta del sistema (diálogo nativo). Solo escritorio.
 * @returns {Promise<string|null>} la ruta elegida, o null si cancela
 */
export async function pickReceiptsDir() {
  try {
    if (!isDesktop()) return null;
    return await window.overseer.pickReceiptsDir();
  } catch {
    return null;
  }
}

/**
 * Guarda el PNG en la carpeta de recibos (sin diálogo). Solo escritorio.
 * @param {{ filename: string, blob: Blob, dir?: string }} d
 * @returns {Promise<string|null>} la ruta final, o null si falló
 */
export async function saveReceiptFile({ filename, blob, dir }) {
  try {
    if (!isDesktop()) return null;
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
    return await window.overseer.saveReceipt({ filename, dataUrl, dir: dir || '' });
  } catch {
    return null;
  }
}
