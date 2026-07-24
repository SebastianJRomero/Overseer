/*
  GasCylinderWidget — Tarjeta del cilindro EN USO de un destino (Sauna o
  Turco/Jacuzzi). Si no hay cilindro activo, muestra el vacío con "Registrar
  compra".

  Datos ya derivados por el service (restantes, pct, costoUso, turco/jacuzzi).
  "Reponer pronto" cuando quedan 10 usos o menos.

  Recibe:
    - destino: 'sauna' | 'compartido'
    - cyl: cilindro activo (enriquecido) o null
    - onRegister / onAddUsage / onFinalize / onHistory: callbacks
*/

import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { formatMoney } from '../../../lib/money';
import { getDestinoStyle } from '../inventoryStyles';
import styles from './GasTab.module.css';

const LOW_THRESHOLD = 10;

export default function GasCylinderWidget({ destino, cyl, onRegister, onAddUsage, onFinalize, onHistory }) {
  const dest = getDestinoStyle(destino);
  const isComp = destino === 'compartido';

  return (
    <div className={styles.cylCard}>
      <div className={styles.cylHead}>
        <span className={styles.cylIcon} style={{ color: dest.color, background: dest.bg }}>◔</span>
        <div className={styles.cylTitle}>
          <span className={styles.cylName}>{dest.label}</span>
          <span className={styles.cylSub}>Cilindro de gas en uso</span>
        </div>
        {cyl && (
          <span
            className={styles.cylBadge}
            style={cyl.restantes <= LOW_THRESHOLD
              ? { color: 'var(--warn)', background: 'var(--warn-bg)' }
              : { color: 'var(--ok)', background: 'var(--ok-bg)' }}
          >
            {cyl.restantes <= LOW_THRESHOLD ? 'Reponer pronto' : 'En buen nivel'}
          </span>
        )}
      </div>

      {cyl ? (
        <div className={styles.cylBody}>
          <span className={styles.cylMeta}>Comprado el {cyl.compra} · {cyl.capLb} lb</span>

          <div className={styles.cylGauge}>
            <div className={styles.cylBig}>
              <span className={styles.cylBigNum}>{cyl.restantes}</span>
              <span className={styles.cylBigLabel}>usos restantes (aprox.) de {cyl.capLb} lb</span>
            </div>
            <ProgressBar value={cyl.pct} color={dest.bar} height={9} />
            <span className={styles.cylMeta}>{cyl.usosCount} usos realizados · {cyl.pct}% consumido</span>
          </div>

          {isComp && (
            <div className={styles.cylSplit}>
              <div className={styles.splitBox}>
                <span className={styles.splitLabel}>Usos en Turco</span>
                <span className={styles.splitNum} style={{ color: 'var(--danger)' }}>{cyl.turco}</span>
              </div>
              <div className={styles.splitBox}>
                <span className={styles.splitLabel}>Usos en Jacuzzi</span>
                <span className={styles.splitNum} style={{ color: 'var(--info)' }}>{cyl.jacuzzi}</span>
              </div>
            </div>
          )}

          <div className={styles.cylMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Costo del cilindro</span>
              <span className={styles.metricVal} style={{ color: 'var(--text-mid)' }}>{formatMoney(cyl.precio)}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Costo por uso</span>
              <span className={styles.metricVal} style={{ color: 'var(--info)' }}>{formatMoney(cyl.costoUso)}</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Usos restantes</span>
              <span className={styles.metricVal} style={{ color: 'var(--ok)' }}>{cyl.restantes}</span>
            </div>
          </div>

          <div className={styles.cylActions}>
            <button type="button" className={styles.ghostBtn} onClick={onHistory}>↺ Historial</button>
            <button type="button" className={styles.outlineBtn} onClick={onFinalize}>Marcar finalizado</button>
            <button type="button" className={styles.accentBtn} onClick={onAddUsage}>＋ Registrar uso</button>
          </div>
        </div>
      ) : (
        <div className={styles.cylEmpty}>
          <span className={styles.cylEmptyText}>
            No hay ningún cilindro en uso para este destino. Registra la compra para empezar a llevar el control de usos.
          </span>
          <button type="button" className={styles.accentBtn} onClick={onRegister}>＋ Registrar compra</button>
        </div>
      )}
    </div>
  );
}
