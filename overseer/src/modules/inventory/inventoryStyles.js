/*
  modules/inventory/inventoryStyles.js — Vocabulario visual del inventario.

  Solo colores/etiquetas (como memberStyles). Las REGLAS de estado viven en
  lib/inventoryStatus.js; aquí solo se decide cómo se pinta cada estado.
*/

/** Estado del producto (derivado del stock) → color, fondo y punto. */
export const PRODUCT_STATUS_STYLES = {
  'En stock': { color: 'var(--ok)', bg: 'var(--ok-bg)', dot: 'var(--ok-strong)' },
  'Bajo': { color: 'var(--warn)', bg: 'var(--warn-bg)', dot: 'var(--warn)' },
  'Agotado': { color: 'var(--danger)', bg: 'var(--danger-bg)', dot: 'var(--danger-strong)' },
};

/** Categoría del producto → pareja color/fondo del badge. */
export const CATEGORY_STYLES = {
  'Bebidas': { color: 'var(--info)', bg: 'var(--info-bg)' },
  'Suplementos': { color: 'var(--ok)', bg: 'var(--ok-bg)' },
  'Accesorios': { color: 'var(--text-soft)', bg: 'var(--surface-3)' },
  'Otros': { color: 'var(--holiday)', bg: 'var(--surface-3)' },
};

/** Estado del equipo → color, fondo y punto. */
export const EQUIPMENT_STATUS_STYLES = {
  'Operativo': { color: 'var(--ok)', bg: 'var(--ok-bg)', dot: 'var(--ok-strong)' },
  'Mantenimiento': { color: 'var(--warn)', bg: 'var(--warn-bg)', dot: 'var(--warn)' },
  'Fuera de servicio': { color: 'var(--danger)', bg: 'var(--danger-bg)', dot: 'var(--danger-strong)' },
};

/** Color del stock (cifra) según su estado. */
export const STOCK_COLORS = {
  'En stock': 'var(--text-mid)',
  'Bajo': 'var(--warn)',
  'Agotado': 'var(--danger)',
};

/**
 * Estilo de un destino de gas. "compartido" = Turco/Jacuzzi (azul),
 * "sauna" = cilindro propio (coral). Incluye la etiqueta legible.
 */
export const GAS_DESTINO_STYLES = {
  sauna: { label: 'Sauna', color: 'var(--danger)', bg: 'var(--danger-bg)', bar: 'var(--acc-grad)' },
  compartido: { label: 'Turco / Jacuzzi', color: 'var(--info)', bg: 'var(--info-bg)', bar: 'linear-gradient(90deg,#4d8ef0,#7fb1f5)' },
};

export function getDestinoStyle(destino) {
  return GAS_DESTINO_STYLES[destino] || GAS_DESTINO_STYLES.sauna;
}

/** Color/fondo por servicio de un uso (para el historial). */
export const SERVICE_STYLES = {
  Turco: { color: 'var(--danger)', bg: 'var(--danger-bg)' },
  Jacuzzi: { color: 'var(--info)', bg: 'var(--info-bg)' },
  Sauna: { color: 'var(--danger)', bg: 'var(--danger-bg)' },
};
