/*
  ProductRow — Una fila de la tabla de productos en venta.

  Nombre + badge de categoría, badge de estado (derivado del stock), stock
  coloreado y precio. Clic en la fila abre el modal de edición.

  Recibe:
    - product: { id, nombre, categoria, stock, venta, compra }
    - onEdit: (product) => void
*/

import { formatMoney } from '../../../lib/money';
import { getProductStatus } from '../../../lib/inventoryStatus';
import { PRODUCT_STATUS_STYLES, CATEGORY_STYLES, STOCK_COLORS } from '../inventoryStyles';
import styles from './InventoryPanel.module.css';

export default function ProductRow({ product, onEdit }) {
  const estado = getProductStatus(product.stock);
  const es = PRODUCT_STATUS_STYLES[estado];
  const cat = CATEGORY_STYLES[product.categoria] || CATEGORY_STYLES.Otros;

  return (
    <button
      type="button"
      className={`${styles.row} ${styles.gridProducts} ${styles.rowClickable}`}
      onClick={() => onEdit(product)}
      title="Editar producto"
    >
      <span className={styles.nameCell}>
        <span className={styles.name}>{product.nombre}</span>
        <span className={styles.catBadge} style={{ color: cat.color, background: cat.bg }}>
          {product.categoria}
        </span>
      </span>

      <span className={styles.statusCell} style={{ color: es.color, background: es.bg }}>
        <span className={styles.statusDot} style={{ background: es.dot }} />
        {estado}
      </span>

      <span className={styles.numCell}>
        <span className={styles.num} style={{ color: STOCK_COLORS[estado] }}>{product.stock}</span>
        <span className={styles.numLabel}>en stock</span>
      </span>

      <span className={styles.precio}>{formatMoney(product.venta)}</span>
    </button>
  );
}
