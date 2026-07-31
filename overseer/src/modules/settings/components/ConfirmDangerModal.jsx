/*
  ConfirmDangerModal — Confirmación FUERTE para acciones destructivas.

  Reutiliza el chrome de los modales de Ajustes (SettingsModal.module.css) pero
  el botón de acción es rojo y solo se habilita cuando el usuario ESCRIBE la
  palabra exacta (p. ej. ELIMINAR / RESETEAR / IMPORTAR). Es la barrera que pide
  el frente 5: no basta con un clic para borrar o resetear.

  Recibe:
    - controller: useModal
    - title, message: qué se va a hacer
    - keyword: palabra que hay que teclear para habilitar el botón
    - confirmLabel: texto del botón (default "Confirmar")
    - busy: true mientras corre la acción (bloquea el botón)
    - onConfirm: () => void  (el padre ejecuta y cierra)
*/

import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Icon from '../../../components/Icon/Icon';
import chrome from './SettingsModal.module.css';
import styles from './MaintenanceSection.module.css';

export default function ConfirmDangerModal({ controller, title, message, keyword, confirmLabel = 'Confirmar', busy = false, onConfirm }) {
  const [typed, setTyped] = useState('');
  const ok = typed.trim().toUpperCase() === keyword.toUpperCase();
  const run = () => { if (ok && !busy) onConfirm(); };

  return (
    <Modal controller={controller} width={440}>
      <div className={chrome.header}>
        <span className={chrome.headIcon}><Icon name="key" /></span>
        <div className={chrome.heading}>
          <span className={chrome.title}>{title}</span>
          <span className={chrome.subtitle}>Acción destructiva · no se puede deshacer</span>
        </div>
        <button type="button" className={chrome.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={chrome.body}>
        <p className={styles.warnText}>{message}</p>
        <p className={styles.typeHint}>Para confirmar, escribe <b>{keyword}</b>:</p>
        <input
          className={styles.keyInput}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
          placeholder={keyword}
          autoFocus
        />
      </div>

      <div className={chrome.footer}>
        <div className={chrome.actions}>
          <button type="button" className={chrome.cancel} onClick={() => controller.close()}>Cancelar</button>
          <button type="button" className={styles.dangerBtn} disabled={!ok || busy} onClick={run}>
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
