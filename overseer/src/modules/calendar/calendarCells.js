/*
  modules/calendar/calendarCells.js — Construye la grilla del mes (pura).

  Convierte (cursor {y,m} + mapa de eventos) en el array de celdas que
  dibuja CalendarGrid. Se aísla aquí para no meter aritmética de fechas en
  los componentes y para poder razonarla/probarla sola.

  Cada celda es un hueco (blank) o un día con:
    day, dateKey, isToday, weekend, holiday, events (máx 3), extra (nº ocultos).
  La semana es lunes-first (regla del prototipo, ver lib/date).
*/

import { pad2, mondayFirstLead, daysInMonth, dateKey, todayAtMidnight } from '../../lib/date';
import { isHoliday } from '../../lib/holidays';

const MAX_VISIBLE = 3; // eventos mostrados antes del "+n más"

export function buildCalendarCells(cursor, events) {
  const { y, m } = cursor;
  const lead = mondayFirstLead(y, m);      // huecos antes del día 1
  const total = daysInMonth(y, m);
  const todayKey = dateKey(todayAtMidnight());
  const cells = [];

  // Huecos iniciales para alinear el día 1 con su columna (lunes-first).
  for (let i = 0; i < lead; i++) cells.push({ blank: true, key: `b${i}` });

  for (let d = 1; d <= total; d++) {
    const key = `${y}-${pad2(m + 1)}-${pad2(d)}`;
    const dow = (lead + d - 1) % 7;        // 0=Lun … 5=Sáb, 6=Dom
    const dayEvents = (events[key] || [])
      .slice()
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    cells.push({
      blank: false,
      key,
      day: d,
      isToday: key === todayKey,
      weekend: dow >= 5,
      holiday: isHoliday(m, d),
      events: dayEvents.slice(0, MAX_VISIBLE),
      extra: Math.max(0, dayEvents.length - MAX_VISIBLE),
    });
  }

  // Huecos finales para completar la última semana (grilla rectangular).
  while (cells.length % 7 !== 0) cells.push({ blank: true, key: `e${cells.length}` });
  return cells;
}
