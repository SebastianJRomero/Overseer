/*
  MaintenanceSection — Ajustes → Mantenimiento (menú avanzado / secreto).

  Sección OCULTA (Tramo C · frente 5): no aparece en la sub-nav; se revela con
  el atajo Ctrl+Shift+M y solo para Admin o superusuario (lo gestiona
  SettingsModule). Ofrece las tres capacidades pedidas, cada una tras una
  confirmación FUERTE (ConfirmDangerModal):
    1. Respaldo completo: EXPORTAR (BD + config local a un JSON) e IMPORTAR.
    2. Borrado selectivo por entidad (miembros, movimientos, inventario…).
    3. Reset total (borrar todo y dejar el sistema limpio, sin sembrar la demo).

  Tras importar/borrar/resetear se recarga la página para que todos los módulos
  relean datos frescos (no hay router; es la vía simple y segura).

  Recibe las props de useSettings (no las usa: es autocontenida vía services).
*/

import { useRef, useState } from 'react';
import useModal from '../../../hooks/useModal';
import SettingsCard from './SettingsCard';
import ConfirmDangerModal from './ConfirmDangerModal';
import * as maintenance from '../../../services/maintenanceService';
import shared from './SettingsShared.module.css';
import styles from './MaintenanceSection.module.css';

export default function MaintenanceSection() {
  const confirm = useModal();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null); // acción a confirmar
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone: 'ok'|'err', text }

  /* Abre el modal de confirmación con una acción concreta. */
  const ask = (action) => { setFeedback(null); setPending(action); confirm.open(); };

  /* Ejecuta la acción confirmada; en éxito recarga (para refrescar todo). */
  const runPending = async () => {
    if (!pending || busy) return;
    setBusy(true);
    try {
      await pending.run();
      setFeedback({ tone: 'ok', text: pending.okMsg });
      confirm.close(() => setPending(null));
      setTimeout(() => window.location.reload(), 700);
    } catch (e) {
      setFeedback({ tone: 'err', text: e.message || 'Ocurrió un error.' });
      confirm.close(() => setPending(null));
    } finally {
      setBusy(false);
    }
  };

  /* Exportar: descarga un JSON. No es destructivo → sin confirmación. */
  const doExport = async () => {
    try {
      const bundle = await maintenance.exportBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overseer-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({ tone: 'ok', text: 'Respaldo exportado.' });
    } catch (e) {
      setFeedback({ tone: 'err', text: e.message || 'No se pudo exportar.' });
    }
  };

  /* Importar: lee el archivo, valida que sea JSON y pide confirmación. */
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    let bundle;
    try { bundle = JSON.parse(await file.text()); } catch {
      setFeedback({ tone: 'err', text: 'El archivo no es un JSON válido.' });
      return;
    }
    ask({
      title: 'Importar respaldo', keyword: 'IMPORTAR', confirmLabel: 'Importar y reemplazar',
      message: `Se reemplazarán los datos incluidos en "${file.name}". Los registros actuales de esas tablas se perderán.`,
      okMsg: 'Respaldo importado.', run: () => maintenance.importBundle(bundle),
    });
  };

  const askDelete = (ent) => ask({
    title: `Eliminar ${ent.label}`, keyword: 'ELIMINAR', confirmLabel: 'Eliminar registros',
    message: `Se borrarán TODOS los registros de ${ent.label}. Esta acción no se puede deshacer.`,
    okMsg: `Registros de ${ent.label} eliminados.`, run: () => maintenance.clearEntity(ent.name),
  });

  const askReset = () => ask({
    title: 'Resetear todo', keyword: 'RESETEAR', confirmLabel: 'Resetear todo',
    message: 'Se borrará TODA la base de datos y quedará limpia (sin datos ni usuarios de demo). También se restablecen el tema y los módulos, y se cierra tu sesión: deberás volver a entrar (con el superusuario o una cuenta nueva).',
    okMsg: 'Sistema reseteado: quedó limpio y la sesión se cerró.', run: () => maintenance.resetAll(),
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.banner}>
        <b>Zona de mantenimiento avanzado.</b> Acceso restringido al superusuario.
        Las acciones de esta sección son destructivas y afectan a toda la instalación.
      </div>

      {feedback && (
        <div className={feedback.tone === 'ok' ? styles.okMsg : styles.errMsg}>{feedback.text}</div>
      )}

      <SettingsCard title="Respaldo completo" subtitle="Base de datos + configuración local en un solo archivo JSON.">
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Exportar respaldo</span>
            <span className={shared.rowDesc}>Descarga un JSON con todos los datos y la configuración.</span>
          </div>
          <button type="button" className={styles.neutralBtn} onClick={doExport}>↓ Exportar JSON</button>
        </div>
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Importar respaldo</span>
            <span className={shared.rowDesc}>Reemplaza los datos con los de un archivo exportado.</span>
          </div>
          <button type="button" className={styles.neutralBtn} onClick={() => fileRef.current?.click()}>↥ Importar JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} hidden />
        </div>
      </SettingsCard>

      <SettingsCard title="Borrado selectivo" subtitle="Elimina todos los registros de una entidad concreta.">
        {maintenance.ENTITIES.map((ent) => (
          <div key={ent.name} className={shared.row}>
            <div className={shared.rowInfo}>
              <span className={shared.rowLabel}>{ent.label}</span>
            </div>
            <button type="button" className={styles.dangerGhost} onClick={() => askDelete(ent)}>Eliminar</button>
          </div>
        ))}
      </SettingsCard>

      <SettingsCard title="Zona de peligro" subtitle="Borra todo y deja el sistema limpio, listo para usar desde cero.">
        <div className={shared.row}>
          <div className={shared.rowInfo}>
            <span className={shared.rowLabel}>Resetear todo el sistema</span>
            <span className={shared.rowDesc}>Borra la base de datos completa, cierra la sesión y deja la instalación como nueva (sin datos de demo).</span>
          </div>
          <button type="button" className={styles.dangerBtn} onClick={askReset}>Resetear todo</button>
        </div>
      </SettingsCard>

      {pending && (
        <ConfirmDangerModal
          key={pending.title}
          controller={confirm}
          title={pending.title}
          message={pending.message}
          keyword={pending.keyword}
          confirmLabel={pending.confirmLabel}
          busy={busy}
          onConfirm={runPending}
        />
      )}
    </div>
  );
}
