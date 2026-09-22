/*
  ShortcutsSection — Ajustes → Atajos de teclado.

  Lista los 4 atajos del flujo de miembros con su combo actual. "Cambiar"
  captura la siguiente combinación (Ctrl/Alt/Shift + tecla) y la guarda en
  localStorage (lib/shortcuts.js). Sin librerías externas.
*/

import { useState } from 'react';
import SettingsCard from './SettingsCard';
import { loadShortcuts, saveShortcut, resetShortcuts, eventToCombo, SHORTCUT_LABELS } from '../../../lib/shortcuts';
import shared from './SettingsShared.module.css';

export default function ShortcutsSection() {
  const [shortcuts, setShortcuts] = useState(() => loadShortcuts());
  const [capturing, setCapturing] = useState(null);

  const onKeyCapture = (name) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
    setShortcuts(saveShortcut(name, eventToCombo(e)));
    setCapturing(null);
  };

  return (
    <div>
      <SettingsCard title="Atajos de teclado" subtitle="Alt+N nuevo · Alt+← atrás · Alt+I/F fechas. Clic en Cambiar y pulsa la combinación.">
        {Object.keys(SHORTCUT_LABELS).map((name) => (
          <div key={name} className={shared.row}>
            <div className={shared.rowInfo}>
              <span className={shared.rowLabel}>{SHORTCUT_LABELS[name]}</span>
              <span className={shared.rowDesc}>{shortcuts[name]}</span>
            </div>
            {capturing === name ? (
              <input
                autoFocus
                placeholder="Pulsa la combinación…"
                onKeyDown={onKeyCapture(name)}
                onBlur={() => setCapturing(null)}
                aria-label={`Capturar atajo ${SHORTCUT_LABELS[name]}`}
                style={{
                  width: 180, padding: '8px 12px', borderRadius: 'var(--r-btn)',
                  background: 'var(--surface-2)', border: '1px solid var(--acc-1)',
                  color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: 13,
                }}
              />
            ) : (
              <button type="button" className={shared.rowBtn ?? ''} onClick={() => setCapturing(name)}>
                Cambiar
              </button>
            )}
          </div>
        ))}
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Restablecer</span>
            <span className={shared.rowDesc}>Volver a los valores por defecto</span>
          </div>
          <button type="button" onClick={() => setShortcuts(resetShortcuts())}>Restablecer</button>
        </div>
      </SettingsCard>
    </div>
  );
}
