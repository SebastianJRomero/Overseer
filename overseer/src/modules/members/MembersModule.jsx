/*
  MembersModule — Contenedor del módulo de miembros (ARQUITECTURA §3).

  Solo ORQUESTA: los datos vienen de useMembers, las piezas visuales son
  componentes de ./components y aquí se decide qué modal está abierto y
  con qué datos. No dibuja tablas ni formularios él mismo.

  Modales del módulo:
    - ficha (detailModal): clic en una fila o en una fila del filtro.
    - wizard (wizModal): alta ("＋ Agregar") o renovación (desde la ficha).
      Se remonta con `key` en cada apertura para arrancar limpio.
    - filtro (filterModal): chips de la toolbar.
*/

import { useState } from 'react';
import useMembers from './useMembers';
import useModal from '../../hooks/useModal';
import { PLAN_OPTIONS } from '../../lib/memberStatus';
import { onlyDigits } from '../../lib/format';
import MembersToolbar from './components/MembersToolbar';
import MemberTable from './components/MemberTable';
import MemberDetailModal from './components/MemberDetailModal';
import MemberWizard from './components/MemberWizard';
import MemberFilterModal from './components/MemberFilterModal';
import styles from './members.module.css';

export default function MembersModule() {
  const { members, counts, createMember, updateMember, renewMember } = useMembers();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [wizard, setWizard] = useState({ mode: 'add', member: null, key: 0 });
  const [filter, setFilter] = useState(null);

  const detailModal = useModal();
  const wizModal = useModal();
  const filterModal = useModal();

  /* Búsqueda en vivo por nombre, cédula o teléfono. Los números se comparan
     "sin adornos": normalizamos tanto lo escrito como el dato guardado a
     solo dígitos, así "315 665" encuentra el teléfono aunque se guarde y se
     muestre con espacios. */
  const raw = query.trim().toLowerCase();
  const digits = onlyDigits(query);
  const visible = raw
    ? members.filter((m) => {
        const nombreMatch = m.nombre.toLowerCase().includes(raw);
        const numeroMatch = digits.length > 0 &&
          (onlyDigits(m.cedula).includes(digits) || onlyDigits(m.telefono).includes(digits));
        return nombreMatch || numeroMatch;
      })
    : members;

  // La ficha lee SIEMPRE la versión fresca de la lista (ediciones en vivo).
  const selected = members.find((m) => m.id === selectedId) || null;

  const openDetail = (member) => {
    setSelectedId(member.id);
    detailModal.open();
  };

  /* key+1 remonta el wizard: estado inicial limpio en cada apertura. */
  const openAdd = () => {
    setWizard((w) => ({ mode: 'add', member: null, key: w.key + 1 }));
    wizModal.open();
  };

  const openRenew = (member) => {
    detailModal.close();
    setWizard((w) => ({ mode: 'renew', member, key: w.key + 1 }));
    wizModal.open();
  };

  const openFilter = (key) => {
    setFilter(key);
    filterModal.open();
  };

  const saveWizard = async (datos) => {
    if (wizard.mode === 'renew') await renewMember(wizard.member.id, datos);
    else await createMember(datos);
    wizModal.close();
  };

  return (
    <div className={styles.module}>
      <MembersToolbar
        total={members.length}
        counts={counts}
        query={query}
        onQuery={setQuery}
        onFilter={openFilter}
        onAdd={openAdd}
      />

      <MemberTable members={visible} onOpen={openDetail} />

      <MemberDetailModal
        controller={detailModal}
        member={selected}
        planOptions={PLAN_OPTIONS}
        onUpdate={updateMember}
        onRenew={openRenew}
      />

      <MemberWizard
        key={wizard.key}
        controller={wizModal}
        mode={wizard.mode}
        member={wizard.member}
        planOptions={PLAN_OPTIONS}
        onSave={saveWizard}
      />

      <MemberFilterModal
        controller={filterModal}
        filter={filter}
        members={members}
        onOpenMember={(m) => {
          filterModal.close();
          openDetail(m);
        }}
      />
    </div>
  );
}
