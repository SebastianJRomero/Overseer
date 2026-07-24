/*
  ModulesSection — Ajustes → Módulos.

  Dos tarjetas:
    - Opcionales: se pueden ocultar (toggle → ModulesProvider.toggleModule,
      que persiste el flag y, si ocultas el activo, vuelve a Inicio).
    - Base: los módulos núcleo, siempre activos (solo lectura, con ✓).

  Tanto los opcionales (core:false) como los base (core:true) se DERIVAN de
  MODULES — desde la fase 8 los tres opcionales ya están registrados, así que
  no hace falta ninguna lista estática.

  No usa useSettings: la visibilidad de módulos es un contexto global.
*/

import { useModules } from '../../../context/ModulesProvider';
import { MODULES } from '../../../app/moduleRegistry';
import Toggle from '../../../components/Toggle/Toggle';
import Icon from '../../../components/Icon/Icon';
import SettingsCard from './SettingsCard';
import shared from './SettingsShared.module.css';
import styles from './ModulesSection.module.css';

/* Descripción de cada módulo (los metas no llevan `desc`). */
const MODULE_DESC = {
  dashboard: 'Panel principal del día',
  members: 'Registro y estados de membresías',
  calendar: 'Agenda y eventos',
  finance: 'Ingresos, egresos y caja',
  inventory: 'Productos, equipo y zona húmeda',
  settings: 'Configuración del sistema',
  classes: 'Programación de clases grupales',
  trainers: 'Staff y asignación de clientes',
  reports: 'Indicadores y análisis del negocio',
};

export default function ModulesSection() {
  const { flags, toggleModule } = useModules();
  const byOrder = (a, b) => a.order - b.order;
  const optionalModules = MODULES.filter((m) => !m.core).sort(byOrder);
  const coreModules = MODULES.filter((m) => m.core).sort(byOrder);

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Módulos opcionales" subtitle="Actívalos para mostrarlos en la barra de navegación">
        {optionalModules.map((m) => {
          const on = flags[m.id] !== false;
          return (
            <div key={m.id} className={`${shared.row} ${shared.rowHover}`}>
              <span
                className={shared.rowIcon}
                style={on
                  ? { color: 'var(--acc-1)', background: 'var(--danger-bg)' }
                  : { color: 'var(--text-dim)', background: 'var(--surface-2)' }}
              >
                <Icon name={m.icon} />
              </span>
              <div className={shared.rowInfo}>
                <span className={shared.rowLabel}>{m.label}</span>
                <span className={shared.rowDesc}>{MODULE_DESC[m.id] || ''}</span>
              </div>
              <span className={shared.stateLabel} style={{ color: on ? 'var(--ok)' : 'var(--text-muted)' }}>
                {on ? 'Activo' : 'Oculto'}
              </span>
              <Toggle checked={on} onChange={() => toggleModule(m.id)} label={m.label} />
            </div>
          );
        })}
      </SettingsCard>

      <SettingsCard title="Módulos base" subtitle="Siempre activos — no se pueden desactivar">
        {coreModules.map((m) => (
          <div key={m.id} className={shared.row}>
            <span className={styles.coreIcon}><Icon name={m.icon} /></span>
            <div className={shared.rowInfo}>
              <span className={styles.coreLabel}>{m.label}</span>
              <span className={styles.coreDesc}>{MODULE_DESC[m.id] || ''}</span>
            </div>
            <span className={styles.check}><Icon name="check" /></span>
          </div>
        ))}
      </SettingsCard>
    </div>
  );
}
