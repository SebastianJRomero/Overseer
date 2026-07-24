/*
  EquipmentModal — Registrar / editar una máquina o equipo (modal 520px).

  Nombre, cantidad + fecha de última revisión (DatePicker), estado
  (SegmentedOptions) y observaciones. Guardar se bloquea sin nombre.

  Usa overflowVisible para que el calendario del DatePicker sobresalga sin
  recortarse. Se remonta con `key` en cada apertura.

  Recibe:
    - controller: useModal
    - equip: equipo a editar, o null para alta
    - onSave: (data) => void   data = { nombre, cantidad, estado, revision, obs }
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { todayDMY } from '../../../lib/date';
import { EQUIPMENT_STATES } from '../../../lib/inventoryStatus';
import { EQUIPMENT_STATUS_STYLES } from '../inventoryStyles';
import styles from './InventoryModal.module.css';

/* Opciones de estado para SegmentedOptions (cada una con su color/punto). */
const STATE_OPTIONS = EQUIPMENT_STATES.map((s) => ({
  value: s, label: s, color: EQUIPMENT_STATUS_STYLES[s].color, bg: EQUIPMENT_STATUS_STYLES[s].bg, dot: EQUIPMENT_STATUS_STYLES[s].dot,
}));

export default function EquipmentModal({ controller, equip, onSave }) {
  const isEdit = !!equip;
  const [nombre, setNombre] = useState(equip?.nombre || '');
  const [cantidad, setCantidad] = useState(equip ? String(equip.cantidad) : '1');
  const [revision, setRevision] = useState(equip?.revision || todayDMY());
  const [estado, setEstado] = useState(equip?.estado || 'Operativo');
  const [obs, setObs] = useState(equip?.obs || '');

  const canSave = nombre.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ nombre: nombre.trim(), cantidad: Number(cantidad) || 1, estado, revision, obs: obs.trim() });
  };

  return (
    <Modal controller={controller} width={520} overflowVisible>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="diamond" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar equipo' : 'Registrar equipo'}</span>
          <span className={styles.subtitle}>Máquinas y equipos del gimnasio</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre del equipo">
          <input
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Caminadora eléctrica"
            autoFocus
          />
        </Field>

        <div className={styles.grid}>
          <Field label="Cantidad">
            <input
              className={styles.input}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="1"
            />
          </Field>
          <Field label="Fecha de revisión">
            <DatePicker value={revision} onChange={setRevision} align="right" />
          </Field>
        </div>

        <Field label="Estado">
          <SegmentedOptions options={STATE_OPTIONS} value={estado} onChange={setEstado} columns={3} />
        </Field>

        <Field label="Observaciones">
          <textarea
            className={styles.input}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={3}
            placeholder="Ej: Banda requiere lubricación, cambio de cable pendiente…"
          />
        </Field>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Registrar equipo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
