/*
  GasTab — Sub-inventario "Zona húmeda" (control de gas).

  Orquesta las piezas del gas: KPIs, los dos cilindros en uso (Sauna y
  Turco/Jacuzzi), el historial de cilindros y los cuatro modales (compra,
  uso, finalizar, historial de usos). Los datos y acciones llegan por props
  desde InventoryModule (hook useInventory); aquí solo se decide qué modal
  está abierto y con qué cilindro.

  Recibe: cylinders + createPurchase / addUsage / updateUsage / deleteUsage /
  finalizeCylinder.
*/

import { useState } from 'react';
import useModal from '../../../hooks/useModal';
import InventoryKpis from './InventoryKpis';
import GasCylinderWidget from './GasCylinderWidget';
import GasHistory from './GasHistory';
import GasPurchaseModal from './GasPurchaseModal';
import GasUsageModal from './GasUsageModal';
import GasFinalizeModal from './GasFinalizeModal';
import GasHistoryModal from './GasHistoryModal';

export default function GasTab({ cylinders, createPurchase, addUsage, updateUsage, deleteUsage, finalizeCylinder }) {
  const purchaseModal = useModal();
  const usageModal = useModal();
  const finalizeModal = useModal();
  const historyModal = useModal();

  // Payload de cada modal + una key para remontarlos limpios en cada apertura.
  const [purchase, setPurchase] = useState({ destino: 'sauna', key: 0 });
  const [usage, setUsage] = useState({ cyl: null, uso: null, key: 0 });
  const [finalize, setFinalize] = useState({ cyl: null, key: 0 });
  const [historyId, setHistoryId] = useState(null);

  const active = (destino) => cylinders.find((c) => c.destino === destino && !c.finalizado) || null;
  // La ficha de historial lee siempre la versión fresca (usos añadidos/editados).
  const historyCyl = cylinders.find((c) => c.id === historyId) || null;

  const openPurchase = (destino) => { setPurchase((p) => ({ destino, key: p.key + 1 })); purchaseModal.open(); };
  const openUsage = (cyl, uso = null) => { setUsage((u) => ({ cyl, uso, key: u.key + 1 })); usageModal.open(); };
  const openFinalize = (cyl) => { setFinalize((f) => ({ cyl, key: f.key + 1 })); finalizeModal.open(); };
  const openHistory = (cyl) => { setHistoryId(cyl.id); historyModal.open(); };

  const kpis = [
    { label: 'Cilindros activos', value: String(cylinders.filter((c) => !c.finalizado).length), color: 'var(--ok)' },
    { label: 'Usos restantes', value: String(cylinders.filter((c) => !c.finalizado).reduce((s, c) => s + c.restantes, 0)), color: 'var(--info)' },
    { label: 'Cilindros / año', value: String(cylinders.length), color: 'var(--text-mid)' },
  ];

  const savePurchase = async (data) => { await createPurchase(data); purchaseModal.close(); };
  const saveUsage = async (data) => {
    if (usage.uso) await updateUsage(usage.cyl.id, usage.uso.id, data);
    else await addUsage(usage.cyl.id, data);
    usageModal.close();
  };
  const removeUsage = async () => {
    if (usage.uso) await deleteUsage(usage.cyl.id, usage.uso.id);
    usageModal.close();
  };
  const saveFinalize = async (data) => { await finalizeCylinder(finalize.cyl.id, data); finalizeModal.close(); };

  return (
    <>
      <InventoryKpis items={kpis} />

      <GasCylinderWidget
        destino="sauna"
        cyl={active('sauna')}
        onRegister={() => openPurchase('sauna')}
        onAddUsage={() => openUsage(active('sauna'))}
        onFinalize={() => openFinalize(active('sauna'))}
        onHistory={() => openHistory(active('sauna'))}
      />
      <GasCylinderWidget
        destino="compartido"
        cyl={active('compartido')}
        onRegister={() => openPurchase('compartido')}
        onAddUsage={() => openUsage(active('compartido'))}
        onFinalize={() => openFinalize(active('compartido'))}
        onHistory={() => openHistory(active('compartido'))}
      />

      <GasHistory cylinders={cylinders} onView={openHistory} onNewPurchase={() => openPurchase('sauna')} />

      <GasPurchaseModal key={`p${purchase.key}`} controller={purchaseModal} destino={purchase.destino} onSave={savePurchase} />
      {usage.cyl && (
        <GasUsageModal key={`u${usage.key}`} controller={usageModal} cyl={usage.cyl} uso={usage.uso} onSave={saveUsage} onDelete={removeUsage} />
      )}
      {finalize.cyl && (
        <GasFinalizeModal key={`f${finalize.key}`} controller={finalizeModal} cyl={finalize.cyl} onSave={saveFinalize} />
      )}
      <GasHistoryModal controller={historyModal} cyl={historyCyl} onEditUso={(uso) => openUsage(historyCyl, uso)} onAddUso={() => openUsage(historyCyl)} />
    </>
  );
}
