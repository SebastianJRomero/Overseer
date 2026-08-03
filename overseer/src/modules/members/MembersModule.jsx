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

  Estos mismos modales los monta también el Inicio (MemberModalsHost) para
  abrirlos sin traer al usuario hasta aquí — por eso viven en components/ y
  reciben todo por props, sin leer estado del módulo.
*/

import { useMemo, useState } from 'react';
import useMembers from './useMembers';
import useActivePlans from '../../hooks/useActivePlans';
import useModal from '../../hooks/useModal';
import { useSession } from '../../context/SessionProvider';
import { hasPermission } from '../../app/moduleRegistry';
import { SPECIAL_PLAN } from '../../lib/memberStatus';
import { onlyDigits } from '../../lib/format';
import MembersToolbar from './components/MembersToolbar';
import { DEFAULT_SORT, DEFAULT_DIR, sortMembers } from './memberSort';
import MemberTable from './components/MemberTable';
import MemberDetailModal from './components/MemberDetailModal';
import MemberWizard from './components/MemberWizard';
import MemberFilterModal from './components/MemberFilterModal';
import styles from './members.module.css';

export default function MembersModule() {
  const { members, counts, createMember, updateMember, renewMember } = useMembers();
  const plans = useActivePlans();
  // Para la ficha (PlanDropdown): nombres de planes activos + "Especial".
  const planNames = [...plans.map((p) => p.nombre), SPECIAL_PLAN];

  // 'Editar miembros' habilita alta/renovación y la ficha editable. Sin él la
  // tabla y la ficha son de SOLO LECTURA (p. ej. el rol Entrenador consulta).
  const session = useSession();
  const canEdit = hasPermission(session, 'Editar miembros');

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
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

  /* Orden de la tabla (búsqueda ya aplicada). Se controla clicando los
     encabezados; A-Z es el defecto. Clic en la columna activa invierte; clic en
     otra la activa con su dirección natural. */
  const sorted = useMemo(() => sortMembers(visible, sort), [visible, sort]);
  const onSort = (field) => setSort((s) => (s.field === field
    ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    : { field, dir: DEFAULT_DIR[field] }));

  // La ficha lee SIEMPRE la versión fresca de la lista (ediciones en vivo).
  const selected = members.find((m) => m.id === selectedId) || null;

  const openDetail = (member) => {
    setSelectedId(member.id);
    detailModal.open();
  };

  /* key+1 remonta el wizard: estado inicial limpio en cada apertura.
     Guardas defensivas: sin permiso de edición, alta y renovación no abren. */
  const openAdd = () => {
    if (!canEdit) return;
    setWizard((w) => ({ mode: 'add', member: null, key: w.key + 1 }));
    wizModal.open();
  };

  const openRenew = (member) => {
    if (!canEdit) return;
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
        canEdit={canEdit}
      />

      <MemberTable members={sorted} onOpen={openDetail} sort={sort} onSort={onSort} />

      <MemberDetailModal
        controller={detailModal}
        member={selected}
        planOptions={planNames}
        onUpdate={updateMember}
        onRenew={openRenew}
        canEdit={canEdit}
      />

      <MemberWizard
        key={wizard.key}
        controller={wizModal}
        mode={wizard.mode}
        member={wizard.member}
        plans={plans}
        members={members}
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
