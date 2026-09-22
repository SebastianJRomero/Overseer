/*
  lib/shortcuts.js — Atajos de teclado configurables (sin librerías).

  Por qué a mano y no react-hotkeys-hook/mousetrap: son 4 atajos y el
  proyecto prohíbe dependencias sin aprobación (§7). Un matcher de ~30
  líneas con localStorage basta y no añade peso ni riesgo de build.

  Formato guardado: "Alt+N", "Alt+ArrowLeft", "Alt+I", "Alt+F".
*/

const KEY = 'atajos';

/** Defaults: Alt+N nuevo, Alt+← atrás, Alt+I inicio, Alt+F fin. */
export const DEFAULT_SHORTCUTS = {
  nuevoMiembro: 'Alt+N',
  wizardAtras: 'Alt+ArrowLeft',
  fechaInicio: 'Alt+I',
  fechaFin: 'Alt+F',
};

export const SHORTCUT_LABELS = {
  nuevoMiembro: 'Agregar miembro rápido',
  wizardAtras: 'Atrás en el wizard',
  fechaInicio: 'Ir a fecha inicio',
  fechaFin: 'Ir a fecha fin',
};

/** Lee los atajos guardados (mezclados con defaults). */
export function loadShortcuts() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULT_SHORTCUTS, ...raw };
  } catch {
    return { ...DEFAULT_SHORTCUTS };
  }
}

/** Guarda un atajo. @returns el mapa resultante. */
export function saveShortcut(name, combo) {
  const next = { ...loadShortcuts(), [name]: combo };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

/** Restaura los defaults. */
export function resetShortcuts() {
  localStorage.removeItem(KEY);
  return { ...DEFAULT_SHORTCUTS };
}

/** "Alt+N" + KeyboardEvent → ¿coincide? (insensible a mayúsculas). */
export function matchShortcut(combo, e) {
  const parts = String(combo || '').split('+').map((p) => p.trim().toLowerCase());
  const key = parts.pop() || '';
  const wantAlt = parts.includes('alt');
  const wantCtrl = parts.includes('ctrl');
  const wantShift = parts.includes('shift');
  if (!!e.altKey !== wantAlt || !!e.ctrlKey !== wantCtrl || !!e.shiftKey !== wantShift) return false;
  return String(e.key || '').toLowerCase() === key.toLowerCase()
    || (key === 'arrowleft' && e.key === 'ArrowLeft');
}

/** KeyboardEvent → "Alt+N" (para el capturador de Ajustes). */
export function eventToCombo(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const k = e.key === ' ' ? 'Space' : e.key;
  parts.push(k.length === 1 ? k.toUpperCase() : k);
  return parts.join('+');
}
