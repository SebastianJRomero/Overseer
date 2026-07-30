/*
  MemberModalsHost — Los modales de Miembros, montados DENTRO del Inicio.

  Decisión del cliente (fase 5): los KPIs y los vencimientos del Inicio abren
  el modal aquí mismo; NO llevan al módulo Miembros. Igual que el prototipo:
  el Inicio es un panel de trabajo, no un menú de accesos directos.

  Este componente concentra ese cableado para que DashboardModule siga siendo
  delgado. Reutiliza tal cual los modales de Miembros (una sola definición de
  la ficha, el filtro y el wizard en toda la app) y usa las acciones de
  useMembers que le pasa el Inicio, así los KPIs se actualizan al instante.

  Cómo se pide un modal: el padre cambia `request`, un objeto plano
    { kind: 'filter' | 'detail' | 'add', filter?, memberId?, key }
  donde `key` es un contador que sube en cada petición — es lo que permite
  volver a abrir el MISMO modal (dos clics seguidos en "Vencidos").

  Recibe:
    - request: la petición descrita arriba (o null)
    - members: lista con status derivado (useMembers del Inicio)
    - onCreate / onUpdate / onRenew: acciones de useMembers
*/

import { useEffect, useState } from 'react';
import useModal from '../../../hooks/useModal';
import useActivePlans from '../../../hooks/useActivePlans';
import { SPECIAL_PLAN } from '../../../lib/memberStatus';
import MemberFilterModal from '../../members/components/MemberFilterModal';
import MemberDetailModal from '../../members/components/MemberDetailModal';
import MemberWizard from '../../members/components/MemberWizard';

export default function MemberModalsHost({ request, members, onCreate, onUpdate, onRenew }) {
  const filterModal = useModal();
  const detailModal = useModal();
  const wizModal = useModal();
  const plans = useActivePlans();
  const planNames = [...plans.map((p) => p.nombre), SPECIAL_PLAN];

  const [filter, setFilter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [wizard, setWizard] = useState({ mode: 'add', member: null, key: 0 });

  // La ficha lee SIEMPRE la versión fresca de la lista (ediciones en vivo).
  const selected = members.find((m) => m.id === selectedId) || null;

  /* key+1 remonta el wizard: estado inicial limpio en cada apertura. */
  const openAdd = () => {
    setWizard((w) => ({ mode: 'add', member: null, key: w.key + 1 }));
    wizModal.open();
  };

  const openDetail = (id) => {
    setSelectedId(id);
    detailModal.open();
  };

  // Atiende la petición del padre. Depende de request.key, así que dos clics
  // seguidos en el mismo KPI vuelven a abrir el modal.
  useEffect(() => {
    if (!request) return;
    if (request.kind === 'filter') { setFilter(request.filter); filterModal.open(); }
    else if (request.kind === 'detail') openDetail(request.memberId);
    else if (request.kind === 'add') openAdd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const openRenew = (member) => {
    detailModal.close();
    setWizard((w) => ({ mode: 'renew', member, key: w.key + 1 }));
    wizModal.open();
  };

  const saveWizard = async (datos) => {
    if (wizard.mode === 'renew') await onRenew(wizard.member.id, datos);
    else await onCreate(datos);
    wizModal.close();
  };

  return (
    <>
      <MemberFilterModal
        controller={filterModal}
        filter={filter}
        members={members}
        onOpenMember={(m) => { filterModal.close(); openDetail(m.id); }}
      />

      <MemberDetailModal
        controller={detailModal}
        member={selected}
        planOptions={planNames}
        onUpdate={onUpdate}
        onRenew={openRenew}
      />

      <MemberWizard
        key={wizard.key}
        controller={wizModal}
        mode={wizard.mode}
        member={wizard.member}
        plans={plans}
        onSave={saveWizard}
      />
    </>
  );
}
