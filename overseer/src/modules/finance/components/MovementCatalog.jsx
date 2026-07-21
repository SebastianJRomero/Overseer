/*
  MovementCatalog — Columna izquierda del modal de movimiento.

  Lista de artículos del inventario con stepper (− cantidad +). Al elegir
  artículos, el monto del movimiento se calcula solo (precio × cantidad).
  En las SALIDAS aparece además "＋ Nuevo artículo" para agregar uno al vuelo.

  Recibe:
    - catalog: [{ name, price }]
    - items: { name: qty }
    - accent: { color, bg, border } estilo del acento (verde/coral)
    - showNew: boolean (solo salidas)
    - onToggle / onInc / onDec: (name) => void
    - onAddArticle: (name, price) => void
*/

import { useState } from 'react';
import { formatMoney, parseMoney } from '../../../lib/money';
import styles from './MovementModal.module.css';

export default function MovementCatalog({ catalog, items, accent, showNew, onToggle, onInc, onDec, onAddArticle }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const itemCount = Object.values(items).reduce((s, q) => s + q, 0);

  const submitNew = () => {
    const n = name.trim();
    if (!n) return;
    onAddArticle(n, parseMoney(price));
    setName(''); setPrice(''); setAdding(false);
  };

  return (
    <div className={styles.catalog}>
      <div className={styles.catalogHeader}>
        <span className={styles.catalogTitle}>Artículos del inventario</span>
        <span className={styles.catalogCount} style={{ color: accent.color, background: accent.bg }}>
          {itemCount > 0 ? `${itemCount} sel.` : 'Ninguno'}
        </span>
      </div>

      {showNew && (
        <div className={styles.newArticle}>
          {!adding ? (
            <button type="button" className={styles.newArticleBtn} onClick={() => setAdding(true)}>
              ＋ Nuevo artículo
            </button>
          ) : (
            <div className={styles.newArticleForm}>
              <input className={styles.newInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del artículo" />
              <div className={styles.newPriceWrap}>
                <span className={styles.newPricePrefix}>$</span>
                <input className={styles.newPriceInput} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Precio" inputMode="numeric" />
              </div>
              <div className={styles.newActions}>
                <button type="button" className={styles.newCancel} onClick={() => setAdding(false)}>Cancelar</button>
                <button type="button" className={styles.newAdd} style={{ background: accent.solid }} onClick={submitNew}>Agregar</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.catalogList}>
        {catalog.map((a) => {
          const qty = items[a.name] || 0;
          const on = qty > 0;
          return (
            <div
              key={a.name}
              className={styles.article}
              style={on ? { background: accent.bg, borderColor: accent.border } : undefined}
              onClick={() => onToggle(a.name)}
            >
              <div className={styles.articleInfo}>
                <span className={styles.articleName} style={on ? { color: 'var(--text-title)' } : undefined}>{a.name}</span>
                <span className={styles.articlePrice}>{formatMoney(a.price)}</span>
              </div>
              {on ? (
                <div className={styles.stepper} style={{ borderColor: accent.border }} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className={styles.stepBtn} style={{ color: accent.color }} onClick={() => onDec(a.name)}>−</button>
                  <span className={styles.stepQty}>{qty}</span>
                  <button type="button" className={styles.stepBtn} style={{ color: accent.color }} onClick={() => onInc(a.name)}>+</button>
                </div>
              ) : (
                <span className={styles.addMark}>+</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
