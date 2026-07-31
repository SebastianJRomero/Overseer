/*
  DashboardHeader — Encabezado del Inicio.

  "Inicio" + subtítulo "Resumen general — {saludo}" y el botón de acento
  "＋ Agregar miembro".

  El saludo del prototipo estaba fijo ("Buenas tardes, Admin"); aquí se
  arma con la hora real y el nombre de la sesión, que es lo que el usuario
  espera de una app de verdad.

  Recibe:
    - user: nombre del usuario logueado (string o null)
    - canAddMember: si es false se oculta "＋ Agregar miembro" (sin permiso
      'Editar miembros', p. ej. rol Entrenador).
    - onAddMember: () => void
*/

import Icon from '../../../components/Icon/Icon';
import styles from '../dashboard.module.css';

/** "Buenos días" (00-11) · "Buenas tardes" (12-18) · "Buenas noches" (19-23). */
function greetingFor(hour) {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardHeader({ user, canAddMember = true, onAddMember }) {
  const saludo = `${greetingFor(new Date().getHours())}, ${user || 'Admin'}`;

  return (
    <div className={styles.toolbar}>
      <div className={styles.heading}>
        <span className={styles.title}>Inicio</span>
        <span className={styles.subtitle}>Resumen general — {saludo}</span>
      </div>
      {canAddMember && (
        <button type="button" className={styles.addBtn} onClick={onAddMember}>
          <Icon name="add" /> Agregar miembro
        </button>
      )}
    </div>
  );
}
