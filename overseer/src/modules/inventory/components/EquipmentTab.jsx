/*
  EquipmentTab — Sub-inventario "Equipo de gym".

  KPIs (total / en mantenimiento / fuera de servicio) + tabla de equipos +
  modal de registrar/editar. A diferencia del prototipo (donde el guardado
  de equipos no persistía), aquí sí se guarda vía service, como los productos.

  Recibe (props del hook useInventory):
    - equipment, createEquipment, updateEquipment
*/

import { useState } from 'react';
import useModal from '../../../hooks/useModal';
import InventoryKpis from './InventoryKpis';
import EquipmentRow from './EquipmentRow';
import EquipmentModal from './EquipmentModal';
import panel from './InventoryPanel.module.css';

export default function EquipmentTab({ equipment, createEquipment, updateEquipment }) {
  const modal = useModal();
  const [editing, setEditing] = useState(null);
  const [key, setKey] = useState(0);

  const open = (equip) => {
    setEditing(equip);
    setKey((k) => k + 1);
    modal.open();
  };

  const mant = equipment.filter((e) => e.estado === 'Mantenimiento').length;
  const fuera = equipment.filter((e) => e.estado === 'Fuera de servicio').length;

  const kpis = [
    { label: 'Equipos', value: String(equipment.length), color: 'var(--info)' },
    { label: 'En mantenimiento', value: String(mant), color: 'var(--warn)' },
    { label: 'Fuera de servicio', value: String(fuera), color: 'var(--danger)' },
  ];

  const save = async (data) => {
    if (editing) await updateEquipment(editing.id, data);
    else await createEquipment(data);
    modal.close();
  };

  return (
    <>
      <InventoryKpis items={kpis} />

      <div className={panel.panel}>
        <div className={panel.header}>
          <span className={panel.title}>Máquinas y equipos</span>
          <button type="button" className={panel.addBtn} onClick={() => open(null)}>＋ Registrar equipo</button>
        </div>
        <div className={`${panel.headRow} ${panel.gridEquip}`}>
          <span>Equipo</span>
          <span style={{ justifySelf: 'center' }}>Estado</span>
          <span>Observaciones</span>
          <span style={{ textAlign: 'right' }}>Unidades</span>
        </div>
        {equipment.map((e) => (
          <EquipmentRow key={e.id} equip={e} onEdit={open} />
        ))}
      </div>

      <EquipmentModal key={key} controller={modal} equip={editing} onSave={save} />
    </>
  );
}
