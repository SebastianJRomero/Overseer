/*
  GasFinalizeModal — Marcar un cilindro como finalizado (modal 520px).

  Resume los usos registrados, pide la fecha de finalización y el total de
  usos (precargado con los usos actuales, editable por si el conteo real
  difiere) y unas observaciones. Guardar se bloquea sin fecha o sin total.

  Recibe:
    - controller: useModal
    - cyl: cilindro a cerrar (aporta destino y usos derivados)
    - onSave: ({ fechaFin, usosFinal, obsFin }) => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import Icon from '../../../components/Icon/Icon';
import { todayDMY } from '../../../lib/date';
import { getDestinoStyle } from '../inventoryStyles';
import styles from './InventoryModal.module.css';

export default function GasFinalizeModal({ controller, cyl, onSave }) {
  const isComp = cyl.destino === 'compartido';
  const dest = getDestinoStyle(cyl.destino);
  const [fechaFin, setFechaFin] = useState(todayDMY());
  const [usos, setUsos] = useState(String(cyl.usosCount));
  const [obs, setObs] = useState('');

  const canSave = !!fechaFin && usos.length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ fechaFin, usosFinal: Number(usos) || 0, obsFin: obs.trim() });
  };

  return (
    <Modal controller={controller} width={520} overflowVisible>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="gas" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>Marcar cilindro como finalizado</span>
          <span className={styles.subtitle}>{dest.label} · cierre del cilindro</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        {/* Resumen de usos registrados */}
        <div className={styles.note}>
          {isComp ? (
            <div className={styles.noteRow} style={{ paddingTop: 0 }}>
              <span className={styles.noteLabel}>Turco</span>
              <span className={styles.noteValue} style={{ color: 'var(--danger)', marginLeft: 0 }}>{cyl.turco}</span>
              <span className={styles.noteLabel} style={{ marginLeft: 12 }}>Jacuzzi</span>
              <span className={styles.noteValue} style={{ color: 'var(--info)', marginLeft: 0 }}>{cyl.jacuzzi}</span>
              <span className={styles.noteLabel} style={{ marginLeft: 'auto' }}>Total</span>
              <span className={styles.noteValue} style={{ marginLeft: 0 }}>{cyl.usosCount}</span>
            </div>
          ) : (
            <div className={styles.noteRow} style={{ paddingTop: 0 }}>
              <span className={styles.noteLabel}>Usos registrados</span>
              <span className={styles.noteValue}>{cyl.usosCount}</span>
            </div>
          )}
        </div>

        <div className={styles.grid}>
          <Field label="Fecha de finalización">
            <DatePicker value={fechaFin} onChange={setFechaFin} />
          </Field>
          <Field label="Total de usos">
            <input
              className={styles.input}
              value={usos}
              onChange={(e) => setUsos(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea
            className={styles.input}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            placeholder="Ej: Cilindro rendido por completo, sin novedades…"
          />
        </Field>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>Marcar finalizado</button>
        </div>
      </div>
    </Modal>
  );
}
