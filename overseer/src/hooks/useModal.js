/*
  hooks/useModal.js — Estado de un modal con CIERRE DIFERIDO.

  Regla de UX del prototipo: al cerrar un modal no se desmonta de golpe;
  primero se reproduce la animación de salida (cardOut + ovOut, ~170 ms)
  y DESPUÉS se quita del árbol. Este hook encapsula ese baile para que
  ningún componente tenga que manejar timers a mano.

  Uso:
    const modal = useModal();
    modal.open();            // muestra el modal
    modal.close();           // anima la salida y luego desmonta
    <Modal controller={modal}> ... </Modal>

  El hook devuelve un "controller" que el componente <Modal> sabe leer.
*/

import { useEffect, useRef, useState } from 'react';

/* Duración de la animación de salida. Debe coincidir con cardOut/ovOut
   en index.css — si cambias una, cambia la otra. */
const CLOSE_MS = 170;

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);

  // Si el componente que usa el hook se desmonta con el timer corriendo,
  // hay que limpiarlo para no hacer setState sobre algo muerto.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const open = () => {
    clearTimeout(timerRef.current);
    setIsClosing(false);
    setIsOpen(true);
  };

  /**
   * Cierra con animación. Acepta un callback opcional que corre cuando el
   * modal ya se desmontó (útil para limpiar formularios o guardar).
   */
  const close = (onClosed) => {
    // Guard anti-doble-clic: si ya está cerrando, ignorar.
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (typeof onClosed === 'function') onClosed();
    }, CLOSE_MS);
  };

  return { isOpen, isClosing, open, close };
}
