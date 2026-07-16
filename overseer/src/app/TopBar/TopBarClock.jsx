/*
  TopBarClock — Hora y fecha en la barra superior.

  Toda la lógica (formato y refresco cada 15 s) vive en el hook useClock;
  aquí solo se pinta: hora grande + fecha pequeña, ambas en Geist Mono.
*/

import useClock from '../../hooks/useClock';
import styles from './TopBar.module.css';

export default function TopBarClock() {
  const { time, date } = useClock();
  return (
    <div className={styles.clock}>
      <span className={styles.clockTime}>{time}</span>
      <span className={styles.clockDate}>{date}</span>
    </div>
  );
}
