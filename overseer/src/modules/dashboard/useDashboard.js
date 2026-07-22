/*
  modules/dashboard/useDashboard.js — Estado y datos del Inicio.

  El Inicio no tiene datos propios: COMPONE los de otros módulos. Este hook
  es el único punto que habla con los services y expone lo ya masticado:

    - day / isToday / prevDay / nextDay / goToday: cursor de DÍA (el Inicio
      navega por día, no por mes como Finanzas).
    - movements / entradas / salidas: movimientos del día elegido y sus
      totales (los pendientes SÍ suman aquí, igual que el prototipo: son
      dinero del día aunque esté por cobrar).
    - upcoming: próximos eventos del calendario (máx 4).
    - createMovement / settleMovement: mismas acciones que Finanzas, con la
      misma sincronización a calendario (pendientes/recurrentes → evento).

  Los miembros NO se cargan aquí: para eso ya existe useMembers (Miembros),
  que devuelve la lista con el estado derivado y los conteos. Reutilizarlo
  evita duplicar la regla de vencimientos.
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as movementsService from '../../services/movementsService';
import * as eventsService from '../../services/eventsService';
import { getMovementMeta } from '../finance/movementMeta';

/** Fecha de hoy como { y, m, d } (m = 0-11, como Date). */
function todayParts() {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
}

export default function useDashboard() {
  const [day, setDay] = useState(todayParts);
  const [movements, setMovements] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const refresh = useCallback(async () => {
    const [movs, evs] = await Promise.all([
      movementsService.listDay(day.y, day.m, day.d),
      eventsService.getUpcoming(4),
    ]);
    setMovements(movs);
    setUpcoming(evs);
  }, [day]);

  useEffect(() => { refresh(); }, [refresh]);

  const isToday = useMemo(() => {
    const t = todayParts();
    return day.y === t.y && day.m === t.m && day.d === t.d;
  }, [day]);

  /* Totales del día. A diferencia de Finanzas (donde los pendientes NO
     cuentan en el mes), el prototipo los suma en el Inicio: el widget
     responde "qué se movió hoy", incluido lo que quedó por cobrar. */
  const { entradas, salidas } = useMemo(() => {
    let entradas = 0;
    let salidas = 0;
    movements.forEach((mv) => {
      if (getMovementMeta(mv.tipo).sign > 0) entradas += mv.monto;
      else salidas += mv.monto;
    });
    return { entradas, salidas };
  }, [movements]);

  const shift = (delta) => setDay(({ y, m, d }) => {
    const dt = new Date(y, m, d + delta); // Date normaliza fin de mes/año
    return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
  });

  const createMovement = async (mov) => {
    const saved = await movementsService.createMovement(mov);
    // Misma regla que Finanzas: pendientes y recurrentes se agendan.
    await eventsService.addFromMovement(saved);
    await refresh();
  };

  const settleMovement = async (id) => {
    await movementsService.settleMovement(id);
    await refresh();
  };

  return {
    day, isToday, movements, entradas, salidas, upcoming,
    prevDay: () => shift(-1), nextDay: () => shift(1), goToday: () => setDay(todayParts()),
    createMovement, settleMovement,
  };
}
