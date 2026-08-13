/*
  DataSection — Ajustes → Respaldos y datos.

  Exportar a CSV (miembros, inventario, pagos) y copias de seguridad REALES:
  "crear copia ahora" pide al backend un snapshot .db de la BD (que queda en
  disco junto al archivo de la BD), y "copia automática diaria" activa el
  respaldo de las 03:00 que corre el server (lib/backup.js). La lista muestra
  las copias guardadas y permite descargarlas, RESTAURARLAS (reemplaza toda la
  BD, con confirmación fuerte) o borrarlas.

  Nota: "Pagos y recibos" exporta los recibos de los miembros — el libro de
  transacciones unificado llega con el backend (ver Limitaciones conocidas).

  Recibe (de useSettings): backup, backups, setAutoBackup, runBackup,
  deleteBackup.
*/

import { useState } from 'react';
import Toggle from '../../../components/Toggle/Toggle';
import Icon from '../../../components/Icon/Icon';
import SettingsCard from './SettingsCard';
import BackupList from './BackupList';
import ConfirmDangerModal from './ConfirmDangerModal';
import useModal from '../../../hooks/useModal';
import * as membersService from '../../../services/membersService';
import * as inventoryService from '../../../services/inventoryService';
import * as settingsService from '../../../services/settingsService';
import { toCsv, downloadCsv } from '../../../lib/csv';
import { formatCedula, formatPhone } from '../../../lib/format';
import shared from './SettingsShared.module.css';
import styles from './DataSection.module.css';

/* Cada export define cómo construir su CSV desde el service. */
const EXPORTS = [
  {
    key: 'miembros', label: 'Miembros', desc: 'Todos los registros y estados', icon: 'members',
    build: async () => {
      const members = await membersService.listMembers();
      const headers = ['Nombre', 'Cédula', 'Teléfono', 'Inicio', 'Fin', 'Plan', 'Recibo', 'Valor', 'Observaciones'];
      const rows = members.map((m) => [m.nombre, formatCedula(m.cedula), formatPhone(m.telefono), m.inicio, m.fin, m.tipo, m.recibo, m.valor, m.obs || '']);
      return { headers, rows, file: 'overseer-miembros.csv' };
    },
  },
  {
    key: 'inventario', label: 'Inventario', desc: 'Artículos, stock y precios', icon: 'inventory',
    build: async () => {
      const products = await inventoryService.listProducts();
      const headers = ['Producto', 'Categoría', 'Stock', 'Precio venta', 'Precio compra'];
      const rows = products.map((p) => [p.nombre, p.categoria, p.stock, p.venta, p.compra]);
      return { headers, rows, file: 'overseer-inventario.csv' };
    },
  },
  {
    key: 'pagos', label: 'Pagos y recibos', desc: 'Recibos de las membresías', icon: 'finance',
    build: async () => {
      const members = await membersService.listMembers();
      const headers = ['Recibo', 'Miembro', 'Plan', 'Valor', 'Inicio', 'Fin'];
      const rows = members.map((m) => [m.recibo, m.nombre, m.tipo, m.valor, m.inicio, m.fin]);
      return { headers, rows, file: 'overseer-pagos.csv' };
    },
  },
];

export default function DataSection({ backup, backups, setAutoBackup, runBackup, deleteBackup }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // feedback de crear copia: {tone,text}
  const confirm = useModal();
  const [pendingRestore, setPendingRestore] = useState(null); // {name} a restaurar
  const [restoreBusy, setRestoreBusy] = useState(false);

  const doExport = async (exp) => {
    const { headers, rows, file } = await exp.build();
    downloadCsv(file, toCsv(headers, rows));
  };

  const doRun = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await runBackup();
      setMsg({ tone: 'ok', text: 'Copia de seguridad creada.' });
    } catch (e) {
      setMsg({ tone: 'err', text: e.message || 'No se pudo crear la copia.' });
    } finally {
      setBusy(false);
    }
  };

  /* Restaurar pide confirmación FUERTE (escribir RESTAURAR). Tras el éxito se
     recarga la página para que todos los módulos relean datos frescos. */
  const doRestore = async () => {
    if (!pendingRestore || restoreBusy) return;
    setRestoreBusy(true);
    try {
      await settingsService.restoreBackup(pendingRestore.name);
      confirm.close(() => setPendingRestore(null));
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setMsg({ tone: 'err', text: e.message || 'No se pudo restaurar la copia.' });
      confirm.close(() => setPendingRestore(null));
      setRestoreBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Exportar datos">
        {EXPORTS.map((e) => (
          <div key={e.key} className={`${shared.row} ${shared.rowHover}`}>
            <span className={styles.expIcon}><Icon name={e.icon} /></span>
            <div className={shared.rowInfo}>
              <span className={shared.rowLabel}>{e.label}</span>
              <span className={shared.rowDesc}>{e.desc}</span>
            </div>
            <button type="button" className={styles.expBtn} onClick={() => doExport(e)}>↓ CSV</button>
          </div>
        ))}
      </SettingsCard>

      <SettingsCard title="Copias de seguridad">
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Copia automática diaria</span>
            <span className={shared.rowDesc}>Se ejecuta cada día a las 03:00</span>
          </div>
          <Toggle checked={!!backup.auto} onChange={setAutoBackup} label="Copia automática diaria" />
        </div>
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={styles.lastLabel}>Última copia</span>
            <span className={styles.lastValue}>{backup.last || '—'}</span>
            {backup.lastFile && <span className={styles.lastFile}>{backup.lastFile}</span>}
          </div>
          <button type="button" className={styles.backupBtn} onClick={doRun} disabled={busy}>
            <Icon name="refresh" size={13} />
            {busy ? 'Creando…' : 'Crear copia ahora'}
          </button>
        </div>

        {msg && (
          <div className={msg.tone === 'ok' ? styles.okMsg : styles.errMsg}>{msg.text}</div>
        )}

        {backups.length > 0
          ? <BackupList
              backups={backups}
              onDownload={settingsService.downloadBackup}
              onRestore={(b) => { setMsg(null); setPendingRestore(b); confirm.open(); }}
              onDelete={deleteBackup}
            />
          : <div className={styles.empty}>Aún no hay copias guardadas.</div>}
      </SettingsCard>

      {pendingRestore && (
        <ConfirmDangerModal
          key={pendingRestore.name}
          controller={confirm}
          title="Restaurar copia"
          message={`Se reemplazará TODA la base de datos actual con la copia "${pendingRestore.name}". Los registros actuales se perderán (recuerda crear una copia antes si los necesitas).`}
          keyword="RESTAURAR"
          confirmLabel="Restaurar copia"
          busy={restoreBusy}
          onConfirm={doRestore}
        />
      )}
    </div>
  );
}
