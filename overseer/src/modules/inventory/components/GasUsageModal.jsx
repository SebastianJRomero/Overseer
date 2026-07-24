/*
  GasUsageModal — Registrar / editar un uso de cilindro (modal 520px).

  Fecha (DatePicker) + hora (TimePicker), y en el cilindro compartido el
  servicio (Turco / Jacuzzi); en el de sauna el servicio es fijo "Sauna".
  Observaciones opcionales. Guardar se bloquea sin fecha/hora (o sin servicio
  en el compartido). Al editar aparece "Eliminar".

  Recibe:
    - controller: useModal
    - cyl: cilindro destino (aporta `destino`)
    - uso: uso a editar, o null para nuevo
    - onSave: ({ fecha, hora, servicio, obs }) => void
    - onDelete: () => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import TimePicker from '../../../components/TimePicker/TimePicker';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { todayDMY } from '../../../lib/date';
import { getDestinoStyle, SERVICE_STYLES } from '../inventoryStyles';
import styles from './InventoryModal.module.css';

const SERVICE_OPTIONS = [
  { value: 'Turco', label: 'Turco', color: SERVICE_STYLES.Turco.color, bg: SERVICE_STYLES.Turco.bg, dot: SERVICE_STYLES.Turco.color },
  { value: 'Jacuzzi', label: 'Jacuzzi', color: SERVICE_STYLES.Jacuzzi.color, bg: SERVICE_STYLES.Jacuzzi.bg, dot: SERVICE_STYLES.Jacuzzi.color },
];

export default function GasUsageModal({ controller, cyl, uso, onSave, onDelete }) {
  const isComp = cyl.destino === 'compartido';
  const isEdit = !!uso;
  const [fecha, setFecha] = useState(uso?.fecha || todayDMY());
  const [hora, setHora] = useState(uso?.hora || '');
  const [servicio, setServicio] = useState(uso?.servicio || (isComp ? 'Turco' : 'Sauna'));
  const [obs, setObs] = useState(uso?.obs || '');

  const dest = getDestinoStyle(cyl.destino);
  const canSave = !!fecha && !!hora && (!isComp || !!servicio);

  const save = () => {
    if (!canSave) return;
    onSave({ fecha, hora, servicio: isComp ? servicio : 'Sauna', obs: obs.trim() });
  };

  return (
    <Modal controller={controller} width={520} overflowVisible>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="gas" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar uso' : 'Registrar uso'}</span>
          <span className={styles.subtitle}>{dest.label} · {isEdit ? 'editar registro' : 'nuevo registro'}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <div className={styles.grid}>
          <Field label="Fecha">
            <DatePicker value={fecha} onChange={setFecha} />
          </Field>
          <Field label="Hora">
            <TimePicker value={hora} onChange={setHora} align="right" />
          </Field>
        </div>

        {isComp && (
          <Field label="Servicio">
            <SegmentedOptions options={SERVICE_OPTIONS} value={servicio} onChange={setServicio} columns={2} />
          </Field>
        )}

        <Field label="Observaciones">
          <textarea
            className={styles.input}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            placeholder="Ej: Sesión doble, grupo reservado…"
          />
        </Field>
      </div>

      <div className={styles.footer}>
        {isEdit && (
          <button type="button" className={styles.delete} onClick={onDelete}>✕ Eliminar</button>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Registrar uso'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
