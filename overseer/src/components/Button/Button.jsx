/*
  Button — Botón reutilizable del sistema de diseño.

  Recibe:
    - variant: 'accent' (gradiente de marca) | 'green' (entradas de dinero)
               | 'outline' (borde, fondo oscuro) | 'ghost' (solo texto)
    - size: 'md' (36px, por defecto) | 'sm' (32px, para cabeceras de tarjeta)
    - disabled, onClick, title, type y children como cualquier botón.

  Es un <button> real (no un div como el prototipo): accesible con teclado
  y con estado disabled nativo. El estilo deshabilitado replica el del
  prototipo (gris, media opacidad, cursor bloqueado).
*/

import styles from './Button.module.css';

export default function Button({
  variant = 'accent',
  size = 'md',
  disabled = false,
  onClick,
  title,
  type = 'button',
  children,
}) {
  const className = [styles.button, styles[variant], styles[size]].join(' ');
  return (
    <button className={className} disabled={disabled} onClick={onClick} title={title} type={type}>
      {children}
    </button>
  );
}
