/*
  lib/image.js — Imágenes adjuntas (fotos de miembros/cuentas).

  El front redimensiona la foto ANTES de enviarla: una foto de cámara pesa
  varios MB en base64 (≈1.33× el archivo), lo que llenaría la BD y haría la
  ficha lenta. Aquí la bajamos a un máximo de `maxSize` px (manteniendo la
  proporción) y la exportamos en JPEG. La UI no cambia: sigue siendo un data
  URL, solo que liviano.
*/

const DEFAULTS = { maxSize: 512, quality: 0.85 };

/**
 * Lee un archivo de imagen, lo redimensiona a `maxSize` px en su lado mayor
 * (respetando la proporción) y lo devuelve como data URL JPEG.
 * @param {File} file            archivo seleccionado (input type="file")
 * @param {{ maxSize?: number, quality?: number }} [opts]
 * @returns {Promise<string>}    data URL de la imagen lista para guardar
 */
export function resizeImage(file, opts = {}) {
  const { maxSize = DEFAULTS.maxSize, quality = DEFAULTS.quality } = opts;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
