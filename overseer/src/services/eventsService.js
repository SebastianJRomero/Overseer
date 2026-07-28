/*
  services/eventsService.js — Eventos del calendario (API real: Node + Express + SQLite).

  Contrato que consume la UI (via useCalendar, nunca directo desde componentes):
    listEvents()               → Promise<map>   { dateKey: Evento[] }
    saveEvent(dateKey, evento) → Promise<map>   (upsert; asigna id si es nuevo)
    deleteEvent(dateKey, id)   → Promise<map>
    getUpcoming(n)             → Promise<Evento[]>  (para el Inicio)

  Antes: mapa en localStorage. Ahora: fetch a /api/events. `addFromMovement`
  sigue viviendo aquí (arma el título con formatMoney) y llama a saveEvent.

  Evento: { id, title, time ("HH:mm" 24h), type }
*/

import { apiGet, apiPut, apiDelete } from './api';
import { dateKey, parseDMY } from '../lib/date';
import { formatMoney } from '../lib/money';

/** Mapa completo de eventos por día. @returns {Promise<Object>} */
export async function listEvents() {
  return apiGet('/events');
}

/**
 * Crea o actualiza un evento en un día. Sin id → nuevo (el backend le asigna
 * uno); con id → upsert de ese evento.
 * @param {string} key    fecha "aaaa-mm-dd"
 * @param {{id?, title, time, type}} evento
 * @returns {Promise<Object>} mapa actualizado
 */
export async function saveEvent(key, evento) {
  return apiPut('/events', { key, evento });
}

/**
 * Elimina un evento de un día.
 * @param {string} key fecha "aaaa-mm-dd"
 * @param {string} id
 * @returns {Promise<Object>} mapa actualizado
 */
export async function deleteEvent(key, id) {
  return apiDelete(`/events/${key}/${id}`);
}

/**
 * Próximos `n` eventos desde hoy (los usa el widget del Inicio).
 * @param {number} n
 * @returns {Promise<Array>} eventos con su dateKey y timestamp resueltos
 */
export async function getUpcoming(n = 4) {
  return apiGet(`/events/upcoming?n=${n}`);
}

/**
 * Agenda un movimiento en el calendario como evento Cobro/Pago.
 *
 * Regla de negocio del prototipo: los movimientos PENDIENTES y los RECURRENTES
 * se agendan el día de su fecha, para que aparezcan en el calendario y en
 * "Próximos eventos". Los movimientos normales no generan evento.
 *
 * Se queda en el front porque arma el título con formatMoney; delega la
 * persistencia en saveEvent (que ahora va al backend).
 *
 * @param {{id, tipo, monto, motivo, fecha, recurrent}} mov
 * @returns {Promise<Object>} mapa de eventos (actualizado o intacto)
 */
export async function addFromMovement(mov) {
  const pending = mov.tipo === 'entrada_pend' || mov.tipo === 'salida_pend';
  const d = parseDMY(mov.fecha);
  if ((!pending && !mov.recurrent) || !d) return listEvents();

  const income = mov.tipo === 'entrada' || mov.tipo === 'entrada_pend';
  const base = (mov.motivo || '').trim() || (income ? 'Cobro pendiente' : 'Pago pendiente');
  const title = `${base} · ${formatMoney(mov.monto)}${mov.recurrent ? ' (mensual)' : ''}`;
  return saveEvent(dateKey(d), {
    id: mov.id, title, time: '', type: income ? 'Cobro' : 'Pago',
  });
}
