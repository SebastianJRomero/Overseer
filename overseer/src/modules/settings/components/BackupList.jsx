/*
  BackupList — Lista de copias de seguridad reales (archivos .db en disco).

  Recibe de DataSection: backups ([{name,size,date}]), onDownload(name),
  onRestore(name) y onDelete(name). Pinta cada copia con nombre, fecha, tamaño
  y tres acciones (descargar / restaurar / borrar). Gestiona su propio estado
  "ocupado" por fila; los errores de red se ignoran (best-effort) y el feedback
  de éxito/error de la creación lo muestra el padre.
*/

import { useState } from 'react';
import Icon from '../../../components/Icon/Icon';
import styles from './BackupList.module.css';

/** Tamaño en formato humano: 4.3 KB, 1.2 MB… */
function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Fecha ISO → "12/08/2026 · 22:31" (mismo formato que la última copia). */
function fmtDate(iso) {
  const d = new Date(iso);
  const p2 = (n) => String(n).padStart(2, '0');
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} · ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

export default function BackupList({ backups, onDownload, onRestore, onDelete }) {
  const [busyName, setBusyName] = useState(null); // copia en acción (1 a la vez)

  const act = async (name, fn) => {
    if (busyName) return;
    setBusyName(name);
    try {
      await fn(name);
    } catch {
      /* best-effort: el borrado/descarga que falla no debe tumbar la lista */
    } finally {
      setBusyName(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>Copias guardadas</div>
      {backups.map((b) => (
        <div key={b.name} className={styles.row}>
          <span className={styles.icon}><Icon name="diamond" /></span>
          <div className={styles.info}>
            <span className={styles.name}>{b.name}</span>
            <span className={styles.meta}>{fmtDate(b.date)} · {fmtSize(b.size)}</span>
          </div>
          <button
            type="button"
            className={styles.dl}
            onClick={() => act(b.name, onDownload)}
            disabled={busyName === b.name}
            aria-label="Descargar copia"
          ><Icon name="download" /></button>
          <button
            type="button"
            className={styles.res}
            onClick={() => onRestore(b)}
            disabled={busyName === b.name}
            aria-label="Restaurar copia"
          ><Icon name="history" /></button>
          <button
            type="button"
            className={styles.del}
            onClick={() => act(b.name, onDelete)}
            disabled={busyName === b.name}
            aria-label="Borrar copia"
          ><Icon name="close" /></button>
        </div>
      ))}
    </div>
  );
}
