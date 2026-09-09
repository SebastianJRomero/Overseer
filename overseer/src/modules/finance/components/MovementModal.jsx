/*
  MovementModal — Registrar entrada/salida (modal de 3 columnas, 960px).

  Izquierda: catálogo del inventario con steppers (el monto se calcula solo).
  Centro: monto (editable), fecha, observaciones y "pago pendiente".
  Derecha: comprobante (subir imagen → previsualización).

  Acento verde (entrada) o coral (salida). Guardar deshabilitado sin monto.
  Regla de negocio: si se marca "pendiente", el tipo pasa a *_pend y el
  módulo lo agenda como Cobro/Pago en el calendario (ver useFinance).

  Se remonta con `key` en cada apertura (estado inicial limpio).

  Recibe:
    - controller: useModal
    - initial: { kind: 'entrada' | 'salida', fecha }
    - onSave: (mov) => void
*/

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import MoneyInput from '../../../components/MoneyInput/MoneyInput';
import DatePicker from '../../../components/DatePicker/DatePicker';
import MovementCatalog from './MovementCatalog';
import MedioPagoCheck from '../../../components/MedioPagoCheck/MedioPagoCheck';
import * as inventoryService from '../../../services/inventoryService';
import { formatMoney } from '../../../lib/money';
import styles from './MovementModal.module.css';

/* Estilo del acento según el tipo de movimiento. */
function accentFor(kind) {
  return kind === 'salida'
    ? { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)', solid: 'var(--acc-grad)', icon: '↘', title: 'Registrar salida', sub: 'Egreso de dinero de la caja del gimnasio', footer: 'Total salida', save: 'Registrar salida', pendDesc: 'Para pagos a proveedores que harás después — se agenda en el calendario.' }
    : { color: 'var(--ok)', bg: 'var(--ok-bg)', border: 'var(--ok-border)', solid: 'var(--ok-grad)', icon: '↗', title: 'Registrar entrada', sub: 'Ingreso de dinero a la caja del gimnasio', footer: 'Total entrada', save: 'Registrar entrada', pendDesc: 'Para clientes que pagarán después — se agenda en el calendario.' };
}

export default function MovementModal({ controller, initial, onSave }) {
  const kind = initial.kind;
  const accent = accentFor(kind);

  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState([]);           // artículos agregados al vuelo
  const [items, setItems] = useState({});             // { name: qty }
  const [monto, setMonto] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(initial.fecha);
  const [pend, setPend] = useState(false);
  const [factura, setFactura] = useState(null);
  // Medio de pago: default efectivo (mismo criterio que el wizard de miembros).
  const [medioPago, setMedioPago] = useState('efectivo');

  useEffect(() => { inventoryService.listProducts().then(setProducts); }, []);

  // Catálogo = productos del inventario (name/price) + agregados al vuelo.
  const catalog = useMemo(
    () => [...products.map((p) => ({ name: p.nombre, price: p.venta })), ...extras],
    [products, extras],
  );

  // Recalcula el monto sumando precio × cantidad de los artículos elegidos.
  const recalc = (nextItems) => {
    const total = Object.keys(nextItems).reduce((s, n) => {
      const art = catalog.find((c) => c.name === n);
      return s + (art ? art.price * nextItems[n] : 0);
    }, 0);
    setMonto(total > 0 ? total : null);
  };

  const changeItems = (updater) => {
    setItems((prev) => {
      const next = updater({ ...prev });
      recalc(next);
      return next;
    });
  };
  const toggle = (name) => changeItems((it) => { if (it[name]) delete it[name]; else it[name] = 1; return it; });
  const inc = (name) => changeItems((it) => { it[name] = (it[name] || 0) + 1; return it; });
  const dec = (name) => changeItems((it) => { const q = (it[name] || 0) - 1; if (q <= 0) delete it[name]; else it[name] = q; return it; });
  const addArticle = (name, price) => {
    setExtras((e) => [...e, { name, price }]);
    changeItems((it) => { it[name] = (it[name] || 0) + 1; return it; });
  };

  const onFactura = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFactura(ev.target.result);
    reader.readAsDataURL(file);
  };

  const canSave = monto != null && monto > 0;
  const itemCount = Object.values(items).reduce((s, q) => s + q, 0);

  const save = () => {
    if (!canSave) return;
    const tipo = pend ? `${kind}_pend` : kind;
    onSave({ tipo, monto, motivo: motivo.trim(), fecha, recurrent: false, items, factura, medio_pago: medioPago === 'nequi' ? 'nequi' : 'efectivo' });
  };

  return (
    <Modal controller={controller} width={960} overflowVisible>
      <div className={styles.header}>
        <span className={styles.headIcon} style={{ color: accent.color, background: accent.bg, borderColor: accent.border }}>{accent.icon}</span>
        <div className={styles.heading}>
          <span className={styles.title}>{accent.title}</span>
          <span className={styles.sub}>{accent.sub}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <MovementCatalog
          catalog={catalog} items={items} accent={accent} showNew={kind === 'salida'}
          onToggle={toggle} onInc={inc} onDec={dec} onAddArticle={addArticle}
        />

        {/* Centro */}
        <div className={styles.center}>
          <div className={styles.centerGrid}>
            <Field label="Monto">
              <MoneyInput value={monto} onChange={setMonto} />
            </Field>
            <Field label="Fecha">
              <DatePicker value={fecha} onChange={setFecha} align="right" />
            </Field>
          </div>
          <span className={styles.montoHint}>
            {itemCount > 0 ? `Calculado de ${itemCount} artículo${itemCount === 1 ? '' : 's'} del inventario` : 'Selecciona artículos o escríbelo manualmente'}
          </span>

          <Field label="Observaciones">
            <textarea className={styles.textarea} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Juan Pérez — 3 aguas + shaker" rows={3} />
          </Field>

          {/* Mismo check que el wizard: sin marcar = Efectivo. */}
          <MedioPagoCheck checked={medioPago === 'nequi'} onChange={(nequi) => setMedioPago(nequi ? 'nequi' : 'efectivo')} />

          <button type="button" className={styles.pendToggle} style={pend ? { background: 'var(--info-bg)', borderColor: 'var(--info)' } : undefined} onClick={() => setPend(!pend)}>
            <span className={styles.pendCheck} style={pend ? { background: 'linear-gradient(150deg,#5b9bf0,#7fb1f5)', borderColor: 'transparent' } : undefined}>{pend ? '✓' : ''}</span>
            <div className={styles.pendTexts}>
              <span className={styles.pendTitle} style={pend ? { color: 'var(--info)' } : undefined}>Marcar como pago pendiente</span>
              <span className={styles.pendDesc}>{accent.pendDesc}</span>
            </div>
          </button>
        </div>

        {/* Derecha: comprobante */}
        <div className={styles.receipt}>
          <span className={styles.receiptLabel}>Comprobante</span>
          {factura ? (
            <div className={styles.receiptHas}>
              <img className={styles.receiptImg} src={factura} alt="comprobante" />
              <button type="button" className={styles.receiptClear} onClick={() => setFactura(null)}>Quitar ✕</button>
            </div>
          ) : (
            <label className={styles.receiptDrop}>
              <span className={styles.receiptIcon}>▤</span>
              <span className={styles.receiptText}>Subir foto del pago o factura</span>
              <span className={styles.receiptHint}>JPG o PNG</span>
              <input type="file" accept="image/*" onChange={onFactura} hidden />
            </label>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerTotal}>
          {accent.footer}
          <span className={styles.footerAmount} style={{ color: accent.color }}>{formatMoney(monto || 0)}</span>
        </span>
        <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
        <button type="button" className={styles.save} style={canSave ? { background: accent.solid } : { background: 'var(--btn-disabled-bg)', opacity: 0.5, cursor: 'not-allowed' }} onClick={save}>
          {accent.save}
        </button>
      </div>
    </Modal>
  );
}
