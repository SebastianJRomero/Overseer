/*
  Icon — Iconografía centralizada por NOMBRE.

  El prototipo usa glifos unicode (▦ ◉ ▤ …) en lugar de imágenes. Los
  mantenemos, pero detrás de un mapa nombre → glifo: los consumidores piden
  <Icon name="members" /> y nunca escriben el carácter. Así, migrar a SVG
  propios más adelante será cambiar SOLO este archivo (README §8).
*/

const GLYPHS = {
  // módulos (los nombres coinciden con los meta.icon del registry)
  dashboard: '▦',
  members: '◉',
  calendar: '▤',
  classes: '◷',
  trainers: '◈',
  finance: '◫',
  inventory: '▤',
  reports: '▣',
  settings: '◌',
  // acciones y decoración
  add: '＋',
  close: '✕',
  check: '✓',
  edit: '✎',
  prev: '‹',
  next: '›',
  up: '↗',
  down: '↘',
  refresh: '↻',
  history: '↺',
  clock: '◷',
  gas: '◔',
  diamond: '◇',
  gem: '◆',
  wave: '≈',
  dot: '●',
  drop: '▼',
  user: '◐',
  key: '✳',
  switch: '⇄',
  power: '⏻',
  search: '⌕',
  caret: '⌄',
  download: '↓',
  grid: '◱',
  brand: '◈',
};

/**
 * @param {{ name: string, size?: number }} props
 * size es el font-size en px (los glifos escalan como texto).
 */
export default function Icon({ name, size }) {
  const glyph = GLYPHS[name];
  if (!glyph) {
    // Aviso amable en desarrollo: un nombre mal escrito no debe romper la UI.
    console.warn(`<Icon/>: no existe el icono "${name}"`);
    return null;
  }
  return (
    <span aria-hidden="true" style={size ? { fontSize: size } : undefined}>
      {glyph}
    </span>
  );
}
