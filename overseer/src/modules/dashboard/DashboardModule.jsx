/*
  DashboardModule — Contenedor del módulo Inicio (ARQUITECTURA §3).

  El Inicio es el módulo que COMPONE: no tiene datos propios, resume los de
  Miembros (useMembers), Finanzas (movimientos del día) y Calendario
  (próximos eventos). Aquí solo se orquesta:

    1. Se arman las props comunes de los widgets (`ctx`).
    2. Se mapea el registro `widgets.js` en dos columnas — agregar o quitar
       un widget no toca este archivo.

  Decisión del cliente: los KPIs, los vencimientos y "＋ Agregar miembro"
  abren su modal AQUÍ MISMO — no llevan al módulo Miembros. El Inicio es un
  panel de trabajo, no un menú de accesos directos. El cableado de esos tres
  modales vive en MemberModalsHost para no engordar este contenedor; los
  modales son los MISMOS de Miembros (una sola definición en la app) y usan
  las acciones de useMembers, así los KPIs se refrescan al instante.

  Lo único que sí navega es el widget de eventos (→ Calendario) y el KPI de
  ingresos (→ Finanzas): ahí no hay modal que abrir, se va al módulo.
*/

import { useState } from 'react';
import { useModules } from '../../context/ModulesProvider';
import { useSession } from '../../context/SessionProvider';
import { hasPermission } from '../../app/moduleRegistry';
import useModal from '../../hooks/useModal';
import useDashboard from './useDashboard';
import useMembers from '../members/useMembers';
import { DAY_NAMES, MONTH_ABBR, MONTH_NAMES, pad2, todayDMY } from '../../lib/date';
import MovementModal from '../finance/components/MovementModal';
import DashboardHeader from './components/DashboardHeader';
import DashboardKpis from './components/DashboardKpis';
import FinanceSummaryModal from './components/FinanceSummaryModal';
import MemberModalsHost from './components/MemberModalsHost';
import { widgetsOf } from './widgets';
import styles from './dashboard.module.css';

export default function DashboardModule() {
  const { setActive } = useModules();
  const session = useSession();
  const { user } = session;
  const canEditMembers = hasPermission(session, 'Editar miembros');
  const { members, counts, createMember, updateMember, renewMember, undoLastRenew } = useMembers();
  const {
    day, isToday, movements, entradas, salidas, upcoming, summary,
    prevDay, nextDay, goToday, createMovement, settleMovement, refresh: refreshFinance,
  } = useDashboard();

  /* Alta y renovación crean un asiento de membresía en el libro (backend). Como
     eso NO pasa por useDashboard, refrescamos aquí las finanzas del Inicio para
     que los KPIs y "Movimientos del día" se actualicen al instante (antes solo
     cambiaban al cambiar de pestaña). */
  // Devuelven lo guardado (el host del recibo digital necesita el consecutivo).
  const createMemberAndRefresh = async (datos) => { const saved = await createMember(datos); await refreshFinance(); return saved; };
  const renewMemberAndRefresh = async (id, datos) => { const list = await renewMember(id, datos); await refreshFinance(); return list; };
  const updateMemberAndRefresh = async (id, patch) => { await updateMember(id, patch); await refreshFinance(); };
  const undoMemberAndRefresh = async (id, reciboPrevio) => { const out = await undoLastRenew(id, reciboPrevio); await refreshFinance(); return out; };

  const movementModal = useModal();
  const summaryModal = useModal();
  const [movement, setMovement] = useState(null); // { kind, fecha, key }
  // Petición de modal de miembros para MemberModalsHost. La `key` sube en
  // cada clic para poder reabrir el MISMO modal dos veces seguidas.
  const [memberRequest, setMemberRequest] = useState(null);

  // "Lunes 20 jul" — el mismo formato del prototipo para el selector de día.
  const dayLabel = `${DAY_NAMES[new Date(day.y, day.m, day.d).getDay()]} ${pad2(day.d)} ${MONTH_ABBR[day.m]}`;

  // Ingresos del mes = caja recibida este mes según el LIBRO MAYOR (mismo origen
  // que Finanzas). Antes era Σ members.valor (métrica distinta); ahora el KPI y
  // su modal-resumen quedan sincronizados con Finanzas.
  const ingresos = summary.total;
  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  /* key+1 remonta el modal en cada apertura (estado limpio, sin efectos). */
  const openMovement = (kind) => {
    setMovement((mv) => ({ kind, fecha: todayDMY(), key: (mv ? mv.key : 0) + 1 }));
    movementModal.open();
  };

  const saveMovement = async (mov) => {
    await createMovement(mov);
    movementModal.close();
  };

  /** Pide un modal de miembros (lo abre MemberModalsHost, aquí mismo). */
  const askMemberModal = (req) => {
    setMemberRequest((prev) => ({ ...req, key: (prev ? prev.key : 0) + 1 }));
  };

  // Props comunes a TODOS los widgets: cada uno toma lo que necesita.
  const ctx = {
    dayLabel, isToday, prevDay, nextDay, goToday,
    movements, entradas, salidas,
    onSettle: settleMovement,
    onNewMovement: openMovement,
    members,
    onOpenMember: (m) => askMemberModal({ kind: 'detail', memberId: m.id }),
    upcoming,
    onOpenCalendar: () => setActive('calendar'),
  };

  const render = (widget) => <widget.Component key={widget.id} {...ctx} />;

  // Widgets visibles por columna (ya filtrados por permiso). Si la columna
  // principal queda vacía (p. ej. un rol sin Finanzas no ve "Movimientos del
  // día"), colapsamos a UNA columna para no dejar un hueco ancho.
  const mainWidgets = widgetsOf('main', session);
  const sideWidgets = widgetsOf('side', session);
  const singleColumn = mainWidgets.length === 0;

  return (
    <div className={styles.module}>
      <DashboardHeader
        user={user}
        canAddMember={canEditMembers}
        onAddMember={() => askMemberModal({ kind: 'add' })}
      />

      <DashboardKpis
        counts={counts}
        total={members.length}
        ingresos={ingresos}
        session={session}
        onFilterMembers={(filter) => askMemberModal({ kind: 'filter', filter })}
        onOpenSummary={() => summaryModal.open()}
      />

      <div className={singleColumn ? styles.columnsSingle : styles.columns}>
        {!singleColumn && <div className={styles.main}>{mainWidgets.map(render)}</div>}
        <div className={styles.side}>{sideWidgets.map(render)}</div>
      </div>

      {movement && (
        <MovementModal
          key={movement.key}
          controller={movementModal}
          initial={movement}
          onSave={saveMovement}
        />
      )}

      {/* Resumen de caja del mes (del libro mayor), abierto desde el KPI de
          ingresos. El botón "Ver Finanzas" navega para quien quiera el detalle. */}
      <FinanceSummaryModal
        controller={summaryModal}
        summary={summary}
        monthLabel={monthLabel}
        onOpenFinance={() => { summaryModal.close(); setActive('finance'); }}
      />

      {/* Ficha / filtro / alta de miembros, abiertos SIN salir del Inicio. */}
      <MemberModalsHost
        request={memberRequest}
        members={members}
        canEdit={canEditMembers}
        onCreate={createMemberAndRefresh}
        onUpdate={updateMemberAndRefresh}
        onRenew={renewMemberAndRefresh}
        onUndo={undoMemberAndRefresh}
      />
    </div>
  );
}
