/*
  Card — Superficie base de tarjetas.

  El contenedor más repetido del prototipo: fondo --surface-1, borde --border-2
  y radio --r-card. Muchas tarjetas llevan una cabecera con título a la
  izquierda y acciones a la derecha; el prop `title`/`actions` cubre ese caso
  sin obligar a nadie a usarlo (children solo también vale).

  Recibe:
    - title: string o nodo — cabecera con borde inferior
    - actions: nodo a la derecha de la cabecera (botón, badge, contador…)
    - flush: true → sin padding interno (para listas que pegan al borde)
    - highlight: true → borde más marcado + sombra (tarjetas protagonistas,
      como "Movimientos del día")
*/

import styles from './Card.module.css';

export default function Card({ title, actions, flush = false, highlight = false, children }) {
  const classes = [styles.card];
  if (highlight) classes.push(styles.highlight);

  return (
    <section className={classes.join(' ')}>
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.title}>{title}</div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={flush ? undefined : styles.body}>{children}</div>
    </section>
  );
}
