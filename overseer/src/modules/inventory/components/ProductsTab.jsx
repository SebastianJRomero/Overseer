/*
  ProductsTab — Sub-inventario "Productos en venta".

  KPIs (total / stock bajo / agotados) + tabla de productos + modal de
  agregar/editar/eliminar. El estado de cada producto se deriva del stock.

  Recibe (props del hook useInventory, vía InventoryModule):
    - products, createProduct, updateProduct, deleteProduct
*/

import { useState } from 'react';
import useModal from '../../../hooks/useModal';
import { getProductStatus, PRODUCT_STATUS } from '../../../lib/inventoryStatus';
import InventoryKpis from './InventoryKpis';
import ProductRow from './ProductRow';
import ProductModal from './ProductModal';
import panel from './InventoryPanel.module.css';

export default function ProductsTab({ products, createProduct, updateProduct, deleteProduct }) {
  const modal = useModal();
  const [editing, setEditing] = useState(null); // producto en edición o null (alta)
  const [key, setKey] = useState(0);            // remonta el modal en cada apertura

  const open = (product) => {
    setEditing(product);
    setKey((k) => k + 1);
    modal.open();
  };

  const bajos = products.filter((p) => getProductStatus(p.stock) === PRODUCT_STATUS.BAJO).length;
  const agotados = products.filter((p) => getProductStatus(p.stock) === PRODUCT_STATUS.AGOTADO).length;

  const kpis = [
    { label: 'Productos', value: String(products.length), color: 'var(--info)' },
    { label: 'Stock bajo', value: String(bajos), color: 'var(--warn)' },
    { label: 'Agotados', value: String(agotados), color: 'var(--danger)' },
  ];

  const save = async (data) => {
    if (editing) await updateProduct(editing.id, data);
    else await createProduct(data);
    modal.close();
  };

  const remove = async () => {
    if (editing) await deleteProduct(editing.id);
    modal.close();
  };

  return (
    <>
      <InventoryKpis items={kpis} />

      <div className={panel.panel}>
        <div className={panel.header}>
          <span className={panel.title}>Productos en venta</span>
          <button type="button" className={panel.addBtn} onClick={() => open(null)}>＋ Agregar producto</button>
        </div>
        <div className={`${panel.headRow} ${panel.gridProducts}`}>
          <span>Producto</span>
          <span style={{ justifySelf: 'center' }}>Estado</span>
          <span style={{ textAlign: 'right' }}>Stock</span>
          <span style={{ textAlign: 'right' }}>Precio</span>
        </div>
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onEdit={open} />
        ))}
      </div>

      <ProductModal
        key={key}
        controller={modal}
        product={editing}
        onSave={save}
        onDelete={remove}
      />
    </>
  );
}
