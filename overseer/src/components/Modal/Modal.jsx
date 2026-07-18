/*
  Modal — Overlay oscuro con blur + tarjeta centrada + CIERRE DIFERIDO.

  Trabaja en pareja con el hook useModal (hooks/useModal.js):
    - el hook lleva el estado (abierto / cerrando) y el timer de 170 ms,
    - este componente solo pinta y elige las animaciones correctas:
      abriendo → ovIn + cardIn · cerrando → ovOut + cardOut.

  Comportamiento del prototipo que se respeta:
    - clic en el overlay cierra; clic DENTRO de la tarjeta no propaga,
    - la tarjeta no se desmonta hasta que termina la animación de salida.

  Recibe:
    - controller: lo que devuelve useModal() — { isOpen, isClosing, close }
    - width: ancho máximo de la tarjeta en px (cada modal tiene el suyo:
      440 evento, 560 ficha, 620 wizard, 960 movimiento…)
    - onOverlayClose: callback opcional al cerrar por overlay (para limpiar)
    - overflowVisible: true en modales con popovers internos (date-pickers,
      dropdowns) para que puedan SOBRESALIR de la tarjeta sin recortarse ni
      generar scroll. Por defecto la tarjeta recorta y hace scroll.
*/

import styles from './Modal.module.css';

export default function Modal({ controller, width = 520, onOverlayClose, overflowVisible = false, children }) {
  const { isOpen, isClosing, close } = controller;

  // Sin desmontar hasta que la animación de salida termine (cierre diferido).
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      style={{ animation: isClosing ? 'ovOut .16s ease forwards' : 'ovIn .2s ease' }}
      onClick={() => close(onOverlayClose)}
    >
      <div
        className={overflowVisible ? `${styles.card} ${styles.cardVisible}` : styles.card}
        style={{
          width: `min(${width}px, 100%)`,
          animation: isClosing
            ? 'cardOut .16s ease forwards'
            : 'cardIn .32s cubic-bezier(.2,.9,.3,1)',
        }}
        // El clic dentro de la tarjeta NO debe llegar al overlay (no cerrar).
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
