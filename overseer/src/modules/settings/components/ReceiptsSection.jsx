/*
  ReceiptsSection — Ajustes → Recibo digital.

  Toggle que activa el modal de recibo al final del alta/renovación + prefijo
  del consecutivo global (RC). Cuando está activo, el wizard ya no pide el
  número manual: el backend lo asigna en transacción.

  Recibe (de useSettings): receipts, setReceipt.
*/

import { useEffect, useState } from 'react';
import Toggle from '../../../components/Toggle/Toggle';
import SettingsCard from './SettingsCard';
import { isDesktop, openReceiptsFolder, defaultReceiptsDir, pickReceiptsDir } from '../../../lib/desktop';
import shared from './SettingsShared.module.css';
import styles from './NotificationsSection.module.css';

export default function ReceiptsSection({ receipts, setReceipt }) {
  const enabled = !!receipts?.enabled;
  const autoDownload = !!receipts?.autoDownload;
  const [folderMsg, setFolderMsg] = useState('');
  const [appDir, setAppDir] = useState('');
  const desktop = isDesktop();

  // Carpeta por defecto de la app (puente Electron; en web no existe).
  useEffect(() => {
    if (desktop) defaultReceiptsDir().then(setAppDir).catch(() => {});
  }, [desktop]);

  // Lo elegido en Ajustes manda; si no, la carpeta de la app.
  const shownDir = receipts?.receiptsDir || appDir || 'Carpeta de la app';

  const onOpenFolder = async () => {
    const ok = await openReceiptsFolder(receipts?.receiptsDir);
    setFolderMsg(ok ? 'Carpeta abierta' : 'No se pudo abrir');
  };

  const onPickFolder = async () => {
    const picked = await pickReceiptsDir();
    if (picked) {
      await setReceipt('receiptsDir', picked);
      setFolderMsg('Carpeta actualizada');
    }
  };
  return (
    <div className={styles.wrap}>
      <SettingsCard
        title="Recibo digital"
        subtitle="Al activar, se muestra al final del registro y la renovación"
      >
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Activar recibo digital</span>
            <span className={shared.rowDesc}>
              {enabled
                ? 'El número se genera solo (consecutivo global) y se muestra el recibo con QR'
                : 'Apagado: el número de recibo se digita manual como hoy'}
            </span>
          </div>
          <Toggle checked={enabled} onChange={(v) => setReceipt('enabled', v)} label="Activar recibo digital" />
        </div>

        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Descargar respaldo al PC</span>
            <span className={shared.rowDesc}>
              {autoDownload
                ? 'Cada recibo generado se guarda como PNG en Descargas'
                : 'Apagado: el PNG solo se copia al portapapeles'}
            </span>
          </div>
          <Toggle checked={autoDownload} onChange={(v) => setReceipt('autoDownload', v)} label="Descargar respaldo al PC" />
        </div>

        {desktop ? (
          <div className={shared.row}>
            <div className={shared.rowInfo}>
              <span className={shared.rowLabel}>Carpeta de recibos</span>
              <span className={shared.rowDesc}>{folderMsg || shownDir}</span>
            </div>
            <div className={styles.folderBtns}>
              <button type="button" className={styles.folderBtn} onClick={onPickFolder}>
                Cambiar
              </button>
              <button type="button" className={styles.folderBtn} onClick={onOpenFolder}>
                Abrir carpeta
              </button>
            </div>
          </div>
        ) : (
          <div className={shared.row}>
            <div className={shared.rowInfo}>
              <span className={shared.rowLabel}>Carpeta de recibos</span>
              <span className={shared.rowDesc}>
                {autoDownload
                  ? 'En web se guardan en Descargas; elige carpeta en la app de escritorio'
                  : 'Elige carpeta en la app de escritorio'}
              </span>
            </div>
          </div>
        )}

        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Prefijo del consecutivo</span>
            <span className={shared.rowDesc}>2 a 6 letras/números · ej. RC → RC-1056</span>
          </div>
          <input
            className={styles.prefixInput ?? ''}
            value={receipts?.prefix ?? 'RC'}
            onChange={(e) => setReceipt('prefix', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="RC"
            maxLength={6}
            aria-label="Prefijo del consecutivo"
            style={{
              width: 90, padding: '8px 12px', borderRadius: 'var(--r-btn)',
              background: 'var(--surface-2)', border: '1px solid var(--border-2)',
              color: 'var(--text-title)', fontFamily: 'var(--font-mono)', fontSize: 13,
              textTransform: 'uppercase',
            }}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
