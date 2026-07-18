/*
  hooks/usePopover.js — Estado de un popover con CIERRE ANIMADO.

  Primo pequeño de useModal: los popovers del prototipo (date-pickers,
  selector de hora, menú de plan) también se despiden animados, pero con
  una animación más corta (pickerOut, ~150 ms) y además se pueden ABRIR Y
  CERRAR desde el mismo disparador (toggle sobre el campo).

  Devuelve:
    - isOpen: el popover está montado (incluye el ratito del cierre)
    - isClosing: está reproduciendo la animación de salida
    - isActive: abierto y NO cerrándose — para pintar el borde de acento
      del campo disparador exactamente como el prototipo
    - open / close / toggle
*/

import { useEffect, useRef, useState } from 'react';

/* Debe coincidir con la duración de pickerOut en index.css. */
const CLOSE_MS = 150;

export default function usePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const open = () => {
    clearTimeout(timerRef.current);
    setIsClosing(false);
    setIsOpen(true);
  };

  const close = () => {
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, CLOSE_MS);
  };

  /** Clic en el disparador: abre si está cerrado, cierra si está abierto. */
  const toggle = () => {
    if (isOpen && !isClosing) close();
    else open();
  };

  return { isOpen, isClosing, isActive: isOpen && !isClosing, open, close, toggle };
}
