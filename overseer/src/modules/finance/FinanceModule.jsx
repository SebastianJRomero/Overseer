/*
  FinanceModule — Contenedor del módulo Finanzas (ARQUITECTURA §3).

  Solo ORQUESTA: los datos vienen de useFinance; las piezas visuales son
  componentes de ./components. Aquí se decide qué modal está abierto
  (KPI detalle, historial, o registrar movimiento) y con qué datos.

  Los modales se remontan con `key` en cada apertura (estado inicial limpio).
*/

import { useState } from 'react';
import useFinance from './useFinance';
import useModal from '../../hooks/useModal';
import useSwapAnimation from '../../hooks/useSwapAnimation';
import { MONTH_NAMES, todayDMY } from '../../lib/date';
import MonthNav from '../../components/MonthNav/MonthNav';
import FinanceKpis from './components/FinanceKpis';
import MovementList from './components/MovementList';
import IncomeBreakdown from './components/IncomeBreakdown';
import UpcomingExpenses from './components/UpcomingExpenses';
import KpiDetailModal from './components/KpiDetailModal';
import FinanceHistoryModal from './components/FinanceHistoryModal';
import MovementModal from './components/MovementModal';
import styles from './finance.module.css';

export default function FinanceModule() {
  const {
    cursor, isCurrentMonth, monthData, history, incomeBreakdown, upcoming,
    prevMonth, nextMonth, goToday, createMovement, settleMovement,
  } = useFinance();

  const kpiModal = useModal();
  const historyModal = useModal();
  const movementModal = useModal();
  const [kpiKind, setKpiKind] = useState(null);
  const [movementInit, setMovementInit] = useState(null);
  const [movKey, setMovKey] = useState(0);

  const monthLabel = `${MONTH_NAMES[cursor.m]} ${cursor.y}`;
  // Al cambiar de mes, los KPIs y el detalle vuelven a entrar con una micro
  // transición (fundido + leve subida), igual que el prototipo. El truco de
  // alternar swapA/swapB fuerza al navegador a re-animar (ver useSwapAnimation).
  const monthSwap = useSwapAnimation(`${cursor.y}-${cursor.m}`, ['swapA', 'swapB']);

  const openKpi = (kind) => { setKpiKind(kind); kpiModal.open(); };

  const openMovement = (kind) => {
    setMovementInit({ kind, fecha: todayDMY() });
    setMovKey((k) => k + 1);
    movementModal.open();
  };

  const saveMovement = async (mov) => {
    await createMovement(mov);
    movementModal.close();
  };

  return (
    <div className={styles.module}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <span className={styles.title}>Finanzas</span>
          <span className={styles.subtitle}>Entradas y salidas — <span className={styles.month}>{monthLabel}</span></span>
        </div>
        <MonthNav
          label={monthLabel}
          isToday={isCurrentMonth}
          todayLabel="Actual"
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
        />
      </div>

      {/* KPIs + detalle: al cambiar de mes, monthSwap alterna el keyframe y el
          navegador re-anima el grupo (sin remontar). */}
      <div className={styles.swapGroup} style={{ animation: monthSwap }}>
        <FinanceKpis
          entradas={monthData.entradas}
          salidas={monthData.salidas}
          balance={monthData.balance}
          movCount={monthData.movements.length}
          history={history}
          onOpenKpi={openKpi}
          onOpenHistory={historyModal.open}
        />

        <div className={styles.main}>
        <MovementList
          monthLabel={monthLabel}
          movements={monthData.movements}
          onConfirm={settleMovement}
          onNewEntrada={() => openMovement('entrada')}
          onNewSalida={() => openMovement('salida')}
        />
        <div className={styles.sidebar}>
          <IncomeBreakdown rows={incomeBreakdown} />
          <UpcomingExpenses rows={upcoming} />
        </div>
        </div>
      </div>

      <KpiDetailModal
        controller={kpiModal}
        kind={kpiKind}
        monthData={monthData}
        monthLabel={monthLabel}
        onConfirm={settleMovement}
      />
      <FinanceHistoryModal controller={historyModal} history={history} />
      {movementInit && (
        <MovementModal key={movKey} controller={movementModal} initial={movementInit} onSave={saveMovement} />
      )}
    </div>
  );
}
