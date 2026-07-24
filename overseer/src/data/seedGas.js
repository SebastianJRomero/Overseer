/*
  data/seedGas.js — Cilindros de gas de la zona húmeda (mock).

  Dos destinos: "sauna" (cilindro propio) y "compartido" (Turco / Jacuzzi).
  Cada cilindro tiene una lista de USOS; el estado y las métricas (usos
  restantes, % consumido, costo por uso) se DERIVAN en el service, no se
  guardan.

  Las fechas se anclan a HOY (como el resto de semillas del proyecto) para
  que la demo siempre muestre dos cilindros "en uso" recientes y varios ya
  finalizados en meses anteriores, sin importar cuándo se abra la app.

  Uso: { id, fecha 'dd/mm/aaaa', hora 'HH:mm', servicio, obs }
  Cilindro: { id, destino, compra, precio, capLb, usos[], finalizado,
              fechaFin?, usosFinal?, obsFin? }
*/

import { formatDMY, todayAtMidnight } from '../lib/date';

/* Patrones ciclados del prototipo para que los usos se vean variados. */
const SVC_CYCLE = ['Turco', 'Jacuzzi', 'Turco', 'Jacuzzi', 'Jacuzzi', 'Turco', 'Jacuzzi'];
const HOURS = ['08:15', '10:40', '13:20', '16:05', '18:30', '19:45', '20:10'];
const NOTAS = ['', '', 'Sesión doble', '', 'Grupo reservado', '', ''];

/** Date a partir de "hoy + offset" en días (offset negativo = pasado). */
function dayOffset(days) {
  const d = todayAtMidnight();
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Genera `n` usos terminando en `endDate` y retrocediendo 1-3 días cada vez
 * (ids deterministas para poder editar/eliminar). Devuelve del más antiguo
 * al más reciente.
 */
function genUsos(cylId, destino, n, endDate) {
  const arr = [];
  const d = new Date(endDate);
  for (let i = 0; i < n; i++) {
    arr.push({
      id: `${cylId}-u${i}`,
      fecha: formatDMY(d),
      hora: HOURS[i % HOURS.length],
      servicio: destino === 'compartido' ? SVC_CYCLE[i % SVC_CYCLE.length] : 'Sauna',
      obs: NOTAS[i % NOTAS.length],
    });
    d.setDate(d.getDate() - (1 + (i % 3)));
  }
  return arr.reverse();
}

/** Cilindros de ejemplo (2 en uso + 3 finalizados), anclados a hoy. */
export function buildSeedGas() {
  return [
    // ── En uso ──
    { id: 'gas-sauna-a', destino: 'sauna', compra: formatDMY(dayOffset(-52)), precio: 180000, capLb: 60, usos: genUsos('gas-sauna-a', 'sauna', 26, dayOffset(-1)), finalizado: false },
    { id: 'gas-comp-a', destino: 'compartido', compra: formatDMY(dayOffset(-34)), precio: 185000, capLb: 60, usos: genUsos('gas-comp-a', 'compartido', 31, dayOffset(0)), finalizado: false },
    // ── Finalizados ──
    { id: 'gas-sauna-b', destino: 'sauna', compra: formatDMY(dayOffset(-107)), precio: 175000, capLb: 58, usos: genUsos('gas-sauna-b', 'sauna', 58, dayOffset(-53)), finalizado: true, fechaFin: formatDMY(dayOffset(-53)), usosFinal: 58, obsFin: 'Cilindro rendido por completo, sin novedades.' },
    { id: 'gas-comp-b', destino: 'compartido', compra: formatDMY(dayOffset(-83)), precio: 182000, capLb: 61, usos: genUsos('gas-comp-b', 'compartido', 61, dayOffset(-36)), finalizado: true, fechaFin: formatDMY(dayOffset(-36)), usosFinal: 61, obsFin: 'Se agotó antes de lo estimado por alta demanda de jacuzzi.' },
    { id: 'gas-sauna-c', destino: 'sauna', compra: formatDMY(dayOffset(-163)), precio: 172000, capLb: 60, usos: genUsos('gas-sauna-c', 'sauna', 60, dayOffset(-109)), finalizado: true, fechaFin: formatDMY(dayOffset(-109)), usosFinal: 60, obsFin: '' },
  ];
}
