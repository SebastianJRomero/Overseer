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
    - canEdit: permiso 'Editar miembros'. Si es false, la ficha abre en SOLO
      LECTURA y no se atienden peticiones de alta ('add').
    - onCreate / onUpdate / onRenew: acciones de useMembers
*/

import { useEffect, useState } from 'react';
import useModal from '../../../hooks/useModal';
import useActivePlans from '../../../hooks/useActivePlans';
import { SPECIAL_PLAN } from '../../../lib/memberStatus';
import { todayDMY } from '../../../lib/date';
import { receiptCode } from '../../../lib/receiptCode';
import * as settingsService from '../../../services/settingsService';
import * as receiptsService from '../../../services/receiptsService';
import MemberFilterModal from '../../members/components/MemberFilterModal';
import MemberDetailModal from '../../members/components/MemberDetailModal';
import MemberWizard from '../../members/components/MemberWizard';
import ReceiptModal from '../../members/components/ReceiptModal';

export default function MemberModalsHost({ request, members, canEdit = true, onCreate, onUpdate, onRenew }) {
  const filterModal = useModal();
  const detailModal = useModal();
  const wizModal = useModal();
  const receiptModal = useModal();
  const plans = useActivePlans();
  const planNames = [...plans.map((p) => p.nombre), SPECIAL_PLAN];

  const [filter, setFilter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [wizard, setWizard] = useState({ mode: 'add', member: null, key: 0 });

  // Recibo digital (mismo cableado que MembersModule): si está activo, el
  // wizard omite el número manual y al guardar se muestra el comprobante.
  const [receiptsCfg, setReceiptsCfg] = useState({ enabled: false, autoDownload: false, receiptsDir: '' });
  const receiptsOn = !!receiptsCfg.enabled;
  const [nextNumero, setNextNumero] = useState('');
  const [gymName, setGymName] = useState('OVERSEER Fitness Club');
  const [lastReceipt, setLastReceipt] = useState(null);

  useEffect(() => {
    settingsService.getReceipts().then((r) => setReceiptsCfg({ enabled: !!r?.enabled, autoDownload: !!r?.autoDownload, receiptsDir: r?.receiptsDir || '' })).catch(() => {});
    settingsService.getGymInfo().then((g) => { if (g?.nombre) setGymName(g.nombre); }).catch(() => {});
  }, []);

  const peekNumero = () => {
    if (!receiptsOn) return;
    receiptsService.peekNext().then((r) => setNextNumero(r.numero)).catch(() => {});
  };

  // La ficha lee SIEMPRE la versión fresca de la lista (ediciones en vivo).
  const selected = members.find((m) => m.id === selectedId) || null;

  /* key+1 remonta el wizard: estado inicial limpio en cada apertura.
     Sin permiso de edición no se abre el alta (guarda defensiva). */
  const openAdd = () => {
    if (!canEdit) return;
    setWizard((w) => ({ mode: 'add', member: null, key: w.key + 1 }));
    peekNumero();
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
    if (!canEdit) return;
    detailModal.close();
    setWizard((w) => ({ mode: 'renew', member, key: w.key + 1 }));
    peekNumero();
    wizModal.open();
  };

  const saveWizard = async (datos) => {
    if (!receiptsOn) {
      if (wizard.mode === 'renew') await onRenew(wizard.member.id, datos);
      else await onCreate(datos);
      wizModal.close();
      return;
    }
    let saved = null;
    if (wizard.mode === 'renew') {
      const list = await onRenew(wizard.member.id, datos);
      saved = (list || []).find((m) => m.id === wizard.member.id) || null;
    } else {
      saved = await onCreate(datos);
    }
    wizModal.close();
    if (saved?.recibo) {
      setLastReceipt({
        member: saved,
        recibo: { numero: saved.recibo, codigo: receiptCode(saved.recibo, saved.id), fecha: todayDMY() },
      });
      receiptModal.open();
    }
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
        autoRecibo={receiptsOn}
        nextNumero={nextNumero}
      />

      {lastReceipt && (
        <ReceiptModal
          controller={receiptModal}
          gymName={gymName}
          member={lastReceipt.member}
          recibo={lastReceipt.recibo}
          autoDownload={receiptsCfg.autoDownload}
          receiptsDir={receiptsCfg.receiptsDir}
        />
      )}
    </>
  );
}
