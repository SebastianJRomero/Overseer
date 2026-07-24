/*
  DataSection — Ajustes → Respaldos y datos.

  Exportar a CSV (miembros, inventario, pagos) y copias de seguridad (copia
  automática + "crear copia ahora", que sella la fecha). Los CSV se generan en
  el cliente desde los services (no hay backend todavía).

  Nota: "Pagos y recibos" exporta los recibos de los miembros — el libro de
  transacciones unificado llega con el backend (ver Limitaciones conocidas).

  Recibe (de useSettings): backup, setAutoBackup, runBackup.
*/

import Toggle from '../../../components/Toggle/Toggle';
import Icon from '../../../components/Icon/Icon';
import SettingsCard from './SettingsCard';
import * as membersService from '../../../services/membersService';
import * as inventoryService from '../../../services/inventoryService';
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

export default function DataSection({ backup, setAutoBackup, runBackup }) {
  const doExport = async (exp) => {
    const { headers, rows, file } = await exp.build();
    downloadCsv(file, toCsv(headers, rows));
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
            <span className={styles.lastValue}>{backup.last}</span>
          </div>
          <button type="button" className={styles.backupBtn} onClick={runBackup}>↻ Crear copia ahora</button>
        </div>
      </SettingsCard>
    </div>
  );
}
