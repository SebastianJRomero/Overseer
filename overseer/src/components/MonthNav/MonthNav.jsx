/*
  MonthNav — Navegador ‹ / etiqueta / › + botón "Hoy".

  Lo usan tres módulos: Inicio (por día), Calendario y Finanzas (por mes).
  Regla visual del prototipo: el botón "Hoy"/"Actual" solo se enciende con
  el acento cuando el cursor YA está en el periodo real — así el usuario ve
  de un vistazo si se alejó del presente.

  Recibe:
    - label: texto central ("Julio 2026", "Miércoles 16 jul")
    - onPrev / onNext / onToday
    - isToday: boolean — ¿el cursor está en el periodo actual?
    - todayLabel: "Hoy" (default) o "Actual" (finanzas)
*/

import styles from './MonthNav.module.css';

export default function MonthNav({ label, onPrev, onNext, onToday, isToday, todayLabel = 'Hoy' }) {
  return (
    <div className={styles.nav}>
      <button type="button" className={styles.arrow} onClick={onPrev} aria-label="Anterior">
        ‹
      </button>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.arrow} onClick={onNext} aria-label="Siguiente">
        ›
      </button>
      <button
        type="button"
        className={isToday ? `${styles.today} ${styles.todayOn}` : styles.today}
        onClick={onToday}
      >
        {todayLabel}
      </button>
    </div>
  );
}
