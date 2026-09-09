/*
  MedioPagoCheck — Check "Nequi" para el paso de pago.

  Sin marcar = Efectivo (default del negocio). Marcado = Nequi.
  UI tonta y reutilizable: solo pinta `checked` y avisa `onChange`.
  La normalización ('efectivo' | 'nequi') vive en cada módulo/service.
*/

import styles from './MedioPagoCheck.module.css';

export default function MedioPagoCheck({ checked, onChange }) {
  const nequi = !!checked;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={nequi}
      aria-label="Pago por Nequi"
      className={nequi ? `${styles.row} ${styles.on}` : styles.row}
      onClick={() => onChange(!nequi)}
    >
      <span className={nequi ? `${styles.box} ${styles.boxOn}` : styles.box}>
        {nequi ? '✓' : ''}
      </span>
      <span className={styles.texts}>
        <span className={styles.title}>Nequi</span>
        <span className={styles.desc}>
          {nequi ? 'Se registrará como pago por Nequi' : 'Sin marcar se registra como Efectivo'}
        </span>
      </span>
    </button>
  );
}
