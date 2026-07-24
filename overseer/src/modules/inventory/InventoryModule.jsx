/*
  InventoryModule — Contenedor del módulo Inventario (ARQUITECTURA §3).

  Solo ORQUESTA: carga los datos con useInventory, guarda qué sub-inventario
  está activo y monta el Component de esa pestaña (del registro inventoryTabs).
  No dibuja tablas ni KPIs él mismo — cada pestaña trae los suyos, así agregar
  o quitar un sub-inventario nunca toca este archivo.

  El contenido de la pestaña se re-anima al cambiar (invSwap), igual que el
  prototipo (fundido + leve subida sin remontar los datos del hook).
*/

import { useState } from 'react';
import useInventory from './useInventory';
import useSwapAnimation from '../../hooks/useSwapAnimation';
import { INVENTORY_TABS, DEFAULT_TAB } from './inventoryTabs';
import InventoryTabs from './components/InventoryTabs';
import styles from './inventory.module.css';

export default function InventoryModule() {
  const inventory = useInventory();
  const [tab, setTab] = useState(DEFAULT_TAB);

  const meta = INVENTORY_TABS.find((t) => t.id === tab) || INVENTORY_TABS[0];
  const TabComponent = meta.Component;
  const swap = useSwapAnimation(tab, ['swapA', 'swapB']);

  return (
    <div className={styles.module}>
      {/* Encabezado */}
      <div className={styles.heading}>
        <span className={styles.title}>Inventario</span>
        <span className={styles.subtitle}>Equipos, productos en venta y zona húmeda</span>
      </div>

      <InventoryTabs tabs={INVENTORY_TABS} active={tab} onSelect={setTab} />

      {/* Contenido de la pestaña activa (se re-anima al cambiar de sub-tab). */}
      <div className={styles.content} style={{ animation: swap }}>
        <TabComponent {...inventory} />
      </div>
    </div>
  );
}
