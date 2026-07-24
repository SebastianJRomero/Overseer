/*
  ClassCard — Tarjeta de una clase grupal.

  Icono de color, nombre + coach, hora + días, y la barra de ocupación. El
  porcentaje y el color de la barra se DERIVAN aquí (llena → coral; ≥85% →
  ámbar; si no, el color de la clase).

  Clic en la tarjeta abre el modal de edición.

  Recibe:
    - clase: { nombre, coach, dias, hora, inscritos, cupo, color, bg }
    - onEdit: (clase) => void
*/

import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import styles from './ClassCard.module.css';

export default function ClassCard({ clase, onEdit }) {
  const pct = Math.round((clase.inscritos / clase.cupo) * 100);
  const full = clase.inscritos >= clase.cupo;
  const barColor = full ? 'var(--danger)' : pct >= 85 ? 'var(--warn)' : clase.color;
  const cupoColor = full ? 'var(--danger)' : 'var(--text-mid)';

  return (
    <button type="button" className={styles.card} onClick={() => onEdit(clase)} title="Editar clase">
      <div className={styles.head}>
        <span className={styles.icon} style={{ color: clase.color, background: clase.bg }}>◷</span>
        <div className={styles.info}>
          <span className={styles.nombre}>{clase.nombre}</span>
          <span className={styles.coach}>{clase.coach}</span>
        </div>
        <div className={styles.when}>
          <span className={styles.hora}>{clase.hora}</span>
          <span className={styles.dias}>{clase.dias}</span>
        </div>
      </div>

      <div className={styles.cupos}>
        <div className={styles.cuposHead}>
          <span className={styles.cuposLabel}>Cupos</span>
          <span className={styles.cuposValue} style={{ color: cupoColor }}>{clase.inscritos}/{clase.cupo}</span>
        </div>
        <ProgressBar value={pct} color={barColor} height={6} />
      </div>
    </button>
  );
}
