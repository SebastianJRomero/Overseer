/*
  modules/finance/useFinance.js — Estado y lógica de datos de Finanzas.

  Único punto del módulo que habla con movementsService y eventsService.
  Guarda el cursor de mes y expone los datos ya cargados del mes (movimientos
  + totales), el historial, los desgloses del sidebar, y las acciones de
  registrar/confirmar movimiento.

  Sincronización clave (regla del prototipo): al registrar un movimiento
  PENDIENTE o RECURRENTE, se agenda además como evento Cobro/Pago en el
  calendario (eventsService.addFromMovement).
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as movementsService from '../../services/movementsService';
import * as eventsService from '../../services/eventsService';
import * as inventoryService from '../../services/inventoryService';

export default function useFinance() {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [monthData, setMonthData] = useState({ movements: [], entradas: 0, salidas: 0, balance: 0 });
  const [history, setHistory] = useState([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  // Recarga todo lo que depende del mes visible (y de los movimientos).
  const refresh = useCallback(async () => {
    const { y, m } = cursor;
    const [month, hist, income, exp] = await Promise.all([
      movementsService.listMonth(y, m),
      movementsService.getHistory(y, m),
      movementsService.getIncomeBreakdown(),
      movementsService.getUpcomingExpenses(),
    ]);
    setMonthData(month);
    setHistory(hist);
    setIncomeBreakdown(income);
    setUpcoming(exp);
  }, [cursor]);

  useEffect(() => { refresh(); }, [refresh]);

  const isCurrentMonth = useMemo(() => {
    const n = new Date();
    return cursor.y === n.getFullYear() && cursor.m === n.getMonth();
  }, [cursor]);

  const shift = (delta) => setCursor(({ y, m }) => {
    const d = new Date(y, m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const goToday = () => { const n = new Date(); setCursor({ y: n.getFullYear(), m: n.getMonth() }); };

  const createMovement = async (mov) => {
    const saved = await movementsService.createMovement(mov);
    // Pendientes y recurrentes se agendan en el calendario.
    await eventsService.addFromMovement(saved);
    // Venta con artículos del catálogo → descuenta stock del inventario
    // (también las ventas pendientes: el producto ya salió, aunque falte
    // cobrar). Las salidas y los artículos escritos a mano no afectan stock.
    if (saved.tipo === 'entrada' || saved.tipo === 'entrada_pend') {
      await inventoryService.applySale(saved.items);
    }
    await refresh();
  };

  const settleMovement = async (id) => {
    await movementsService.settleMovement(id);
    await refresh();
  };

  return {
    cursor, isCurrentMonth, monthData, history, incomeBreakdown, upcoming,
    prevMonth: () => shift(-1), nextMonth: () => shift(1), goToday,
    createMovement, settleMovement,
  };
}
