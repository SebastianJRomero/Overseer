/*
  hooks/useWizardDraft.js — Guardrail del wizard (save-state anti-salida accidental).

  Guarda el borrador (datos + paso) en sessionStorage en cada cambio y lo
  ofrece al reabrir. Se limpia al guardar. Es por modo ('add'/'renew'+id)
  para no mezclar altas con renovaciones. Sin backend ni librerías.
*/

import { useEffect, useState } from 'react';

function draftKey(mode, member) {
  return mode === 'renew' ? `wizard-draft-renew-${member?.id || 'x'}` : 'wizard-draft-add';
}

export function loadDraft(mode, member) {
  try {
    const raw = sessionStorage.getItem(draftKey(mode, member));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(mode, member) {
  try { sessionStorage.removeItem(draftKey(mode, member)); } catch { /* noop */ }
}

/**
 * @param {string} mode 'add' | 'renew'
 * @param {object} member miembro en renew
 * @param {object} data estado actual del wizard
 * @param {number} step paso actual
 * @returns {{draft: object|null, clear: () => void}}
 */
export default function useWizardDraft(mode, member, data, step) {
  const [draft] = useState(() => loadDraft(mode, member));
  useEffect(() => {
    try {
      // Solo persiste si hay algo escrito (evita rescatar wizards vacíos).
      const hasContent = Object.values(data || {}).some((v) => String(v ?? '').trim() !== '');
      if (hasContent) sessionStorage.setItem(draftKey(mode, member), JSON.stringify({ data, step }));
    } catch { /* cuota llena: se ignora */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), step]);
  return { draft, clear: () => clearDraft(mode, member) };
}
