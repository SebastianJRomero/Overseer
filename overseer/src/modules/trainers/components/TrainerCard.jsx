/*
  TrainerCard — Tarjeta de un entrenador.

  Avatar con anillo (gradiente de acento si está disponible, borde neutro si
  ausente), nombre + especialidad, estado, y dos cajas con clientes y clases.

  Clic en la tarjeta abre el modal de edición.

  Recibe:
    - trainer: { nombre, esp, clientes, clases, activo }
    - onEdit: (trainer) => void
*/

import { getInitials } from '../../../lib/initials';
import styles from './TrainerCard.module.css';

export default function TrainerCard({ trainer, onEdit }) {
  const ring = trainer.activo ? 'var(--acc-grad)' : 'var(--border-4)';

  return (
    <button type="button" className={styles.card} onClick={() => onEdit(trainer)} title="Editar entrenador">
      <div className={styles.head}>
        {/* Anillo con la técnica de doble fondo (relleno + borde con clip). */}
        <span
          className={styles.avatar}
          style={{ backgroundImage: `linear-gradient(var(--surface-2),var(--surface-2)), ${ring}` }}
        >
          {getInitials(trainer.nombre)}
        </span>
        <div className={styles.info}>
          <span className={styles.nombre}>{trainer.nombre}</span>
          <span className={styles.esp}>{trainer.esp}</span>
        </div>
        <span className={styles.estado} style={{ color: trainer.activo ? 'var(--ok)' : 'var(--text-soft)' }}>
          <span className={styles.dot} style={{ background: trainer.activo ? 'var(--ok-strong)' : 'var(--text-faint)' }} />
          {trainer.activo ? 'Disponible' : 'Ausente'}
        </span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{trainer.clientes}</span>
          <span className={styles.statLabel}>Clientes</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{trainer.clases}</span>
          <span className={styles.statLabel}>Clases</span>
        </div>
      </div>
    </button>
  );
}
