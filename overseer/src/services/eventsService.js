/*
  services/eventsService.js — Eventos del calendario (mock hoy → API mañana).

  Contrato que consume la UI (via useCalendar, nunca directo desde componentes):
    listEvents()               → Promise<map>   { dateKey: Evento[] }
    saveEvent(dateKey, evento) → Promise<map>   (asigna id si es nuevo)
    deleteEvent(dateKey, id)   → Promise<map>
    getUpcoming(n)             → Promise<Evento[]>  (para el Inicio, fase 5)

  Mock: el mapa completo vive en storage bajo 'events'; si no existe se
  siembra con los eventos del prototipo (relativos a hoy). Cuando exista API,
  cada función se vuelve su fetch equivalente y la UI no se entera.

  Evento: { id, title, time ("HH:mm" 24h), type }
*/

import { load, save } from './storage';
import { buildSeedEvents } from '../data/seedEvents';
import { newId } from '../lib/id';
import { dateKey, todayAtMidnight, parseDMY } from '../lib/date';
import { formatMoney } from '../lib/money';

const KEY = 'events';

/** Lee el mapa completo, sembrando los datos de ejemplo la primera vez. */
function readAll() {
  let events = load(KEY, null);
  if (!events) {
    events = buildSeedEvents();
    save(KEY, events);
  }
  return events;
}

/**
 * Mapa completo de eventos por día.
 * @returns {Promise<Object>}
 */
export async function listEvents() {
  return readAll();
}

/**
 * Crea o actualiza un evento en un día. Sin id → nuevo (se le asigna uno);
 * con id → reemplaza el existente en ese día.
 * @param {string} key    fecha "aaaa-mm-dd"
 * @param {{id?, title, time, type}} evento
 * @returns {Promise<Object>} mapa actualizado
 */
export async function saveEvent(key, evento) {
  const events = { ...readAll() };
  const list = (events[key] || []).slice();
  if (evento.id != null) {
    const i = list.findIndex((e) => e.id === evento.id);
    if (i >= 0) list[i] = evento; else list.push(evento);
  } else {
    list.push({ ...evento, id: newId('ev') });
  }
  events[key] = list;
  save(KEY, events);
  return events;
}

/**
 * Elimina un evento de un día (y limpia el día si queda vacío).
 * @param {string} key fecha "aaaa-mm-dd"
 * @param {string} id
 * @returns {Promise<Object>} mapa actualizado
 */
export async function deleteEvent(key, id) {
  const events = { ...readAll() };
  const list = (events[key] || []).filter((e) => e.id !== id);
  if (list.length) events[key] = list;
  else delete events[key];
  save(KEY, events);
  return events;
}

/**
 * Próximos `n` eventos desde hoy (los usa el widget del Inicio en la fase 5).
 * @param {number} n
 * @returns {Promise<Array>} eventos con su dateKey y timestamp resueltos
 */
export async function getUpcoming(n = 4) {
  const events = readAll();
  const today = todayAtMidnight().getTime();
  return Object.keys(events)
    .flatMap((key) => (events[key] || []).map((e) => ({ ...e, dateKey: key })))
    .map((e) => {
      const [Y, M, D] = e.dateKey.split('-').map(Number);
      const [h, min] = (e.time || '00:00').split(':').map(Number);
      return { ...e, ts: new Date(Y, M - 1, D, h, min).getTime() };
    })
    .filter((e) => e.ts >= today)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, n);
}

/**
 * Agenda un movimiento en el calendario como evento Cobro/Pago.
 *
 * Regla de negocio del prototipo: los movimientos PENDIENTES (cobros/pagos
 * que se harán después) y los RECURRENTES (mensuales) se agendan el día de
 * su fecha, para que aparezcan en el calendario y en "Próximos eventos".
 * Los movimientos normales (ya efectuados) no generan evento.
 *
 * @param {{id, tipo, monto, motivo, fecha, recurrent}} mov
 * @returns {Promise<Object>} mapa de eventos (actualizado o intacto)
 */
export async function addFromMovement(mov) {
  const pending = mov.tipo === 'entrada_pend' || mov.tipo === 'salida_pend';
  const d = parseDMY(mov.fecha);
  if ((!pending && !mov.recurrent) || !d) return readAll();

  const income = mov.tipo === 'entrada' || mov.tipo === 'entrada_pend';
  const base = (mov.motivo || '').trim() || (income ? 'Cobro pendiente' : 'Pago pendiente');
  const title = `${base} · ${formatMoney(mov.monto)}${mov.recurrent ? ' (mensual)' : ''}`;
  return saveEvent(dateKey(d), {
    id: mov.id, title, time: '', type: income ? 'Cobro' : 'Pago',
  });
}
