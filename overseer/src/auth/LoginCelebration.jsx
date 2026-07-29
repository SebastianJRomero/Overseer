/*
  LoginCelebration — Confirmación sobria de acceso.

  Capa decorativa (pointer-events: none) que se monta cuando las
  credenciales son válidas, mientras la tarjeta del login se retira
  (`cardAway`). Composición minimalista:

    halo suave verde → círculo con el check que se dibuja en vivo
    (keyframe `stroke`) → saludo con el nombre del usuario.

  Nota: la versión original del prototipo traía confeti y anillos
  expansivos; se simplificó a pedido del cliente (elegante y simple).
*/

import styles from './LoginCelebration.module.css';

export default function LoginCelebration({ userName }) {
  return (
    <div className={styles.layer}>
      <div className={styles.halo} />

      {/* check con trazo dibujado en vivo (dasharray + keyframe stroke) */}
      <div className={styles.check}>
        <svg width="34" height="34" viewBox="0 0 52 52" fill="none">
          <path
            className={styles.checkPath}
            d="M14 27 L23 36 L39 18"
            stroke="var(--ok)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.greeting}>
        <span className={styles.greetingTitle}>¡Bienvenido!</span>
        <span className={styles.greetingName}>{userName}</span>
      </div>
    </div>
  );
}
