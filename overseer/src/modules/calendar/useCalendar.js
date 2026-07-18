/*
  modules/calendar/useCalendar.js — Estado y lógica de datos del calendario.

  Único punto del módulo que habla con eventsService. Guarda el mapa de
  eventos y el "cursor" (mes/año visible). Expone la navegación por mes y
  las acciones de guardar/eliminar evento (que persisten y refrescan).
*/

import { useEffect, useMemo, useState } from 'react';
import * as eventsService from '../../services/eventsService';

/** Suma `delta` meses a {y,m} normalizando el desborde de año. */
function shiftMonth({ y, m }, delta) {
  const d = new Date(y, m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

export default function useCalendar() {
  const [events, setEvents] = useState({});
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });

  useEffect(() => {
    eventsService.listEvents().then(setEvents);
  }, []);

  // ¿El mes que se ve es el real? (para encender el botón "Hoy").
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return cursor.y === now.getFullYear() && cursor.m === now.getMonth();
  }, [cursor]);

  const prevMonth = () => setCursor((c) => shiftMonth(c, -1));
  const nextMonth = () => setCursor((c) => shiftMonth(c, 1));
  const goToday = () => {
    const now = new Date();
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
  };

  const saveEvent = async (dateKey, evento) => {
    setEvents(await eventsService.saveEvent(dateKey, evento));
  };
  const deleteEvent = async (dateKey, id) => {
    setEvents(await eventsService.deleteEvent(dateKey, id));
  };

  return { events, cursor, isCurrentMonth, prevMonth, nextMonth, goToday, saveEvent, deleteEvent };
}
