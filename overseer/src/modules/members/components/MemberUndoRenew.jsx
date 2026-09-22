/*
  MemberUndoRenew — Corrección de duplicado por doble renovar (SOLO superusuario).

  Caso: el admin renovó, cerró el modal sin captura y renovó de nuevo → se
  consumió otro consecutivo y se creó un asiento extra en finanzas. Este
  bloque borra el asiento más reciente del miembro y restaura el recibo previo
  que el superusuario digita (lo copia del PNG/carpeta). Pide confirmación
  escrita para no ejecutarse por accidente.
*/

import { useState } from 'react';
import Button from '../../../components/Button/Button';

export default function MemberUndoRenew({ member, onUndo }) {
  const [open, setOpen] = useState(false);
  const [reciboPrevio, setReciboPrevio] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const run = async () => {
    if (busy || confirm.trim().toUpperCase() !== 'DESHACER') return;
    setBusy(true);
    setMsg('');
    try {
      const out = await onUndo(member.id, reciboPrevio.trim());
      setMsg(out?.deleted ? `Listo: se borró el movimiento ${out.deleted}.` : 'Listo: no había asiento extra para borrar.');
      setOpen(false);
      setConfirm('');
    } catch (e) {
      setMsg(e?.message || 'No se pudo deshacer (¿sesión superusuario?).');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>Deshacer última renovación</Button>
        {msg && <div style={{ fontSize: 12, color: 'var(--ok)', marginTop: 6 }}>{msg}</div>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--warn)' }}>
        Borra el último asiento de membresía de {member.nombre} y restaura el recibo previo (opcional).
      </span>
      <input
        value={reciboPrevio}
        onChange={(e) => setReciboPrevio(e.target.value)}
        placeholder="Recibo previo (ej. RC-1056, opcional)"
        aria-label="Recibo previo a restaurar"
        style={{
          padding: '8px 12px', borderRadius: 'var(--r-btn)', background: 'var(--surface-2)',
          border: '1px solid var(--border-2)', color: 'var(--text-title)',
          fontFamily: 'var(--font-mono)', fontSize: 13,
        }}
      />
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Escribe DESHACER para confirmar"
        aria-label="Confirmación DESHACER"
        style={{
          padding: '8px 12px', borderRadius: 'var(--r-btn)', background: 'var(--surface-2)',
          border: '1px solid var(--danger-border)', color: 'var(--text-title)', fontSize: 13,
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button onClick={run} disabled={busy || confirm.trim().toUpperCase() !== 'DESHACER'}>
          {busy ? 'Deshaciendo…' : 'Confirmar'}
        </Button>
      </div>
      {msg && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{msg}</span>}
    </div>
  );
}
