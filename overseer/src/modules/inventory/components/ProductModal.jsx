/*
  ProductModal — Agregar / editar / eliminar un producto (modal 500px).

  Nombre, categoría (SegmentedOptions), stock y precio de venta, y una caja
  con el precio de COMPRA (uso interno) que muestra el margen por unidad en
  vivo. Guardar se bloquea sin nombre; "Eliminar" solo aparece al editar.

  Se remonta con `key` en cada apertura (el tab pasa la key), así el estado
  inicial se toma limpio de `product`.

  Recibe:
    - controller: useModal
    - product: producto a editar, o null para alta
    - onSave: (data) => void     data = { nombre, categoria, stock, venta, compra }
    - onDelete: () => void
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Field from '../../../components/Field/Field';
import MoneyInput from '../../../components/MoneyInput/MoneyInput';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import Icon from '../../../components/Icon/Icon';
import { formatMoney } from '../../../lib/money';
import { PRODUCT_CATEGORIES } from '../../../lib/inventoryStatus';
import { CATEGORY_STYLES } from '../inventoryStyles';
import styles from './InventoryModal.module.css';

/* Opciones de categoría para SegmentedOptions (cada una con su color). */
const CAT_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({
  value: c, label: c, color: CATEGORY_STYLES[c].color, bg: CATEGORY_STYLES[c].bg,
}));

export default function ProductModal({ controller, product, onSave, onDelete }) {
  const isEdit = !!product;
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [categoria, setCategoria] = useState(product?.categoria || 'Bebidas');
  const [stock, setStock] = useState(product ? String(product.stock) : '1');
  const [venta, setVenta] = useState(product?.venta ?? null);
  const [compra, setCompra] = useState(product?.compra ?? null);

  const canSave = nombre.trim().length > 0;
  const margen = (venta || 0) - (compra || 0);
  const margenPct = venta ? Math.round((margen / venta) * 100) + '%' : '—';
  const margenColor = margen > 0 ? 'var(--ok)' : margen < 0 ? 'var(--danger)' : 'var(--text-muted)';

  const save = () => {
    if (!canSave) return;
    onSave({
      nombre: nombre.trim(), categoria,
      stock: Number(stock) || 0, venta: venta || 0, compra: compra || 0,
    });
  };

  return (
    <Modal controller={controller} width={500}>
      <div className={styles.header}>
        <span className={styles.headIcon}><Icon name="inventory" /></span>
        <div className={styles.heading}>
          <span className={styles.title}>{isEdit ? 'Editar producto' : 'Agregar producto'}</span>
          <span className={styles.subtitle}>{isEdit ? 'Modifica los detalles o elimina el producto' : 'Nuevo producto en venta'}</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.body}>
        <Field label="Nombre del producto">
          <input
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            placeholder="Ej: Proteína Whey 1kg"
            autoFocus
          />
        </Field>

        <Field label="Categoría">
          <SegmentedOptions options={CAT_OPTIONS} value={categoria} onChange={setCategoria} columns={4} />
        </Field>

        <div className={styles.grid}>
          <Field label="Stock">
            <input
              className={styles.input}
              value={stock}
              onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="0"
            />
          </Field>
          <Field label="Precio de venta">
            <MoneyInput value={venta} onChange={setVenta} />
          </Field>
        </div>

        {/* Precio de compra (uso interno) + margen en vivo */}
        <div className={styles.note}>
          <div className={styles.noteHead}>
            <span style={{ color: 'var(--acc-1)' }}><Icon name="gem" /></span>
            <span className={styles.noteTitle}>Precio de compra</span>
            <span className={styles.noteTag}>Uso interno</span>
          </div>
          <MoneyInput value={compra} onChange={setCompra} />
          <div className={styles.noteRow}>
            <span className={styles.noteLabel}>Margen por unidad</span>
            <span className={styles.noteValue} style={{ color: margenColor }}>
              {(margen >= 0 ? '' : '−') + formatMoney(Math.abs(margen))}
            </span>
            <span className={styles.notePct} style={{ color: margenColor }}>{margenPct}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {isEdit && (
          <button type="button" className={styles.delete} onClick={onDelete}>✕ Eliminar</button>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.save} disabled={!canSave} onClick={save}>
            {isEdit ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
