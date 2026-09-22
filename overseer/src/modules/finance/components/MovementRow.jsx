/*
  MovementRow — Una fila de la lista de movimientos.

  Icono por tipo, concepto + etiqueta (con sufijos "saldada"/"mensual"),
  badge "Pendiente" si aplica, fecha corta + hora am/pm, monto con signo y
  color, y el botón de confirmar (✓ Saldar / ✓ Pagar) en los pendientes.

  Recibe:
    - mv: movimiento de dominio (movementsService)
    - onConfirm: (id) => void — confirmar un pendiente
*/

import { formatMoney } from '../../../lib/money';
import { parseDMY, MONTH_ABBR } from '../../../lib/date';
import { getMovementMeta } from '../movementMeta';
import styles from './MovementList.module.css';

/* "05/07/2026" → "05 jul" */
function shortDate(fecha) {
  const d = parseDMY(fecha);
  return d ? `${String(d.getDate()).padStart(2, '0')} ${MONTH_ABBR[d.getMonth()]}` : '';
}

/* "15:45" (24h) → "3:45 p. m." · "" → "" (filas viejas sin hora). */
function horaAmPm(hora) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hora || ''));
  if (!m) return '';
  let h = Number(m[1]);
  const mm = m[2];
  const suffix = h >= 12 ? 'p. m.' : 'a. m.';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mm} ${suffix}`;
}

export default function MovementRow({ mv, onConfirm }) {
  const meta = getMovementMeta(mv.tipo);
  const settledExtra = (mv.tipo === 'entrada_pend' || mv.tipo === 'salida_pend') && mv.settled ? ' · saldada' : '';
  const recurrentExtra = mv.recurrent ? ' · mensual' : '';
  const tipoLabel = meta.label + settledExtra + recurrentExtra;
  // Las OBSERVACIONES suelen decir de quién es el cobro/pago pendiente. Se
  // muestran junto al tipo, en texto más claro y en negrita para leerlas de
  // un vistazo (salvo que ya sean el concepto principal, sin artículos).
  const obs = mv.motivo && mv.motivo !== mv.concepto ? mv.motivo : '';

  // Fecha + hora am/pm ("05 jul · 3:45 p. m."). Sin hora (filas viejas): solo fecha.
  const hora = horaAmPm(mv.hora);
  const fechaLabel = hora ? `${shortDate(mv.fecha)} · ${hora}` : shortDate(mv.fecha);

  const montoLabel = (meta.sign > 0 ? '+ ' : '− ') + formatMoney(mv.monto);
  // Pendientes: se dejan en el color neutro actual (no distraen del aviso de
  // la fila). Confirmados: entradas en verde, egresos en naranja sutil.
  const montoColor = mv.pending ? 'var(--text-muted)' : (meta.sign > 0 ? 'var(--ok)' : 'var(--egreso)');

  // Medio de pago: solo 'nequi' pinta chip informativo; efectivo es el
  // default silencioso (no satura la fila).
  const isNequi = mv.medio_pago === 'nequi';

  const isSalidaPend = mv.tipo === 'salida_pend';
  // Los pendientes se resaltan con un fondo que pulsa despacio; el color del
  // resalte distingue el tipo: azul tenue para cobros (entrada) y ámbar tenue
  // para pagos (salida) — el mismo criterio que la franja y el badge.
  const rowClass = mv.pending
    ? `${styles.row} ${isSalidaPend ? styles.pendingOut : styles.pendingIn}`
    : styles.row;

  return (
    <div className={rowClass} title={obs || undefined}>
      {/* Línea principal: icono · concepto/tipo · badge · fecha · monto · acción */}
      <div className={styles.rowMain}>
        <span className={styles.icon} style={{ color: meta.color, background: meta.bg }}>{meta.icon}</span>

        <div className={styles.info}>
          <span className={styles.concepto}>{mv.concepto}</span>
          {/* El "pendiente" ya lo comunica el resalte de la fila; aquí basta
              la etiqueta de tipo (sin badge redundante, para ganar ancho). */}
          <span className={styles.tipoLabel}>{tipoLabel}</span>
        </div>

        <span className={styles.fecha} title={hora ? `Hora del movimiento: ${hora}` : undefined}>{fechaLabel}</span>
        {isNequi && <span className={`${styles.payChip} ${styles.payNequi}`}>Nequi</span>}
        <span className={styles.monto} style={{ color: montoColor }}>{montoLabel}</span>

        {mv.pending && (
          <button
            type="button"
            className={styles.confirm}
            style={isSalidaPend
              ? { color: 'var(--danger)', background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' }
              : { color: 'var(--ok)', background: 'var(--ok-bg)', borderColor: 'var(--ok-border)' }}
            title="Marcar como saldada"
            onClick={() => onConfirm(mv.id)}
          >
            {isSalidaPend ? '✓ Pagar' : '✓ Saldar'}
          </button>
        )}
      </div>

      {/* Observación (nombre/detalle del pendiente) a lo ANCHO y en claro:
          se lee de un vistazo aunque sea larga, sin apretar la línea principal. */}
      {obs && <div className={styles.obsLine}>{obs}</div>}
    </div>
  );
}
