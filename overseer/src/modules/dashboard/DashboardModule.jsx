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
import useModal from '../../hooks/useModal';
import useDashboard from './useDashboard';
import useMembers from '../members/useMembers';
import { DAY_NAMES, MONTH_ABBR, pad2, todayDMY } from '../../lib/date';
import MovementModal from '../finance/components/MovementModal';
import DashboardHeader from './components/DashboardHeader';
import DashboardKpis from './components/DashboardKpis';
import MemberModalsHost from './components/MemberModalsHost';
import { widgetsOf } from './widgets';
import styles from './dashboard.module.css';

export default function DashboardModule() {
  const { setActive } = useModules();
  const { user } = useSession();
  const { members, counts, createMember, updateMember, renewMember } = useMembers();
  const {
    day, isToday, movements, entradas, salidas, upcoming,
    prevDay, nextDay, goToday, createMovement, settleMovement,
  } = useDashboard();

  const movementModal = useModal();
  const [movement, setMovement] = useState(null); // { kind, fecha, key }
  // Petición de modal de miembros para MemberModalsHost. La `key` sube en
  // cada clic para poder reabrir el MISMO modal dos veces seguidas.
  const [memberRequest, setMemberRequest] = useState(null);

  // "Lunes 20 jul" — el mismo formato del prototipo para el selector de día.
  const dayLabel = `${DAY_NAMES[new Date(day.y, day.m, day.d).getDay()]} ${pad2(day.d)} ${MONTH_ABBR[day.m]}`;

  // Ingresos del mes = lo pagado por las membresías vigentes registradas.
  const ingresos = members.reduce((s, m) => s + (Number(m.valor) || 0), 0);

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

  return (
    <div className={styles.module}>
      <DashboardHeader user={user} onAddMember={() => askMemberModal({ kind: 'add' })} />

      <DashboardKpis
        counts={counts}
        total={members.length}
        ingresos={ingresos}
        onFilterMembers={(filter) => askMemberModal({ kind: 'filter', filter })}
        onOpenFinance={() => setActive('finance')}
      />

      <div className={styles.columns}>
        <div className={styles.main}>{widgetsOf('main').map(render)}</div>
        <div className={styles.side}>{widgetsOf('side').map(render)}</div>
      </div>

      {movement && (
        <MovementModal
          key={movement.key}
          controller={movementModal}
          initial={movement}
          onSave={saveMovement}
        />
      )}

      {/* Ficha / filtro / alta de miembros, abiertos SIN salir del Inicio. */}
      <MemberModalsHost
        request={memberRequest}
        members={members}
        onCreate={createMember}
        onUpdate={updateMember}
        onRenew={renewMember}
      />
    </div>
  );
}
