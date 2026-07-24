/*
  GasPurchaseModal — Registrar compra de un cilindro (modal 500px).

  Destino (Sauna / Turco-Jacuzzi), fecha de compra (DatePicker), precio y
  capacidad en libras. Muestra el costo por uso estimado en vivo. Guardar se
  bloquea si falta fecha, precio o capacidad.

  Recibe:
    - controller: useModal
    - destino: destino preseleccionado
    - onSave: ({ destino, compra, precio, capLb }) => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import MoneyInput from '../../../components/MoneyInput/MoneyInput';
import DatePicker from '../../../components/DatePicker/DatePicker';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { formatMoney } from '../../../lib/money';
import { todayDMY } from '../../../lib/date';
import { GAS_DESTINO_STYLES } from '../inventoryStyles';
import styles from './InventoryModal.module.css';

const DESTINO_OPTIONS = [
  { value: 'sauna', label: 'Sauna', color: GAS_DESTINO_STYLES.sauna.color, bg: GAS_DESTINO_STYLES.sauna.bg, dot: GAS_DESTINO_STYLES.sauna.color },
  { value: 'compartido', label: 'Turco / Jacuzzi', color: GAS_DESTINO_STYLES.compartido.color, bg: GAS_DESTINO_STYLES.compartido.bg, dot: GAS_DESTINO_STYLES.compartido.color },
];

export default function GasPurchaseModal({ controller, destino: initialDestino, onSave }) {
  const [destino, setDestino] = useState(initialDestino || 'sauna');
  const [compra, setCompra] = useState(todayDMY());
  const [precio, setPrecio] = useState(null);
  const [capLb, setCapLb] = useState('');

  const capNum = Number(capLb) || 0;
  const canSave = !!compra && (precio || 0) > 0 && capNum > 0;
  const costoUso = capNum > 0 && precio ? formatMoney(Math.round(precio / capNum)) : '—';

  const save = () => {
    if (!canSave) return;
    onSave({ destino, compra, precio: precio || 0, capLb: capNum });
  };

  return (
    <Modal controller={controller} width={500} overflowVisible>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="gas" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>Registrar compra de cilindro</span>
          <span className={styles.subtitle}>Entrada de un nuevo cilindro de gas</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Destino del cilindro">
          <SegmentedOptions options={DESTINO_OPTIONS} value={destino} onChange={setDestino} columns={2} />
        </Field>

        <div className={styles.grid}>
          <Field label="Fecha de compra">
            <DatePicker value={compra} onChange={setCompra} />
          </Field>
          <Field label="Capacidad (lb)">
            <input
              className={styles.input}
              value={capLb}
              onChange={(e) => setCapLb(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="60"
            />
          </Field>
        </div>

        <Field label="Precio del cilindro">
          <MoneyInput value={precio} onChange={setPrecio} />
        </Field>

        <div className={styles.noteRow}>
          <span className={styles.noteLabel}>Costo por uso estimado</span>
          <span className={styles.noteValue} style={{ color: 'var(--info)' }}>{costoUso}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>Registrar compra</button>
        </div>
      </div>
    </Modal>
  );
}
