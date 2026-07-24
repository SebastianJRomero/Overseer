/*
  ModulesSection — Ajustes → Módulos.

  Dos tarjetas:
    - Opcionales: se pueden ocultar (toggle → ModulesProvider.toggleModule,
      que persiste el flag y, si ocultas el activo, vuelve a Inicio).
    - Base: los módulos núcleo, siempre activos (solo lectura, con ✓).

  Los módulos base se derivan de MODULES (core === true). Los opcionales aún
  no existen como módulos (llegan en la fase 8), pero sus flags ya funcionan;
  se listan estáticos aquí y la fase 8 podrá derivarlos de MODULES al
  registrarlos con core:false.

  No usa useSettings: la visibilidad de módulos es un contexto global.
*/

import { useModules } from '../../../context/ModulesProvider';
import { MODULES } from '../../../app/moduleRegistry';
import Toggle from '../../../components/Toggle/Toggle';
import Icon from '../../../components/Icon/Icon';
import SettingsCard from './SettingsCard';
import shared from './SettingsShared.module.css';
import styles from './ModulesSection.module.css';

/* Módulos opcionales (fase 8). El flag por defecto es visible. */
const OPTIONAL = [
  { id: 'classes', icon: 'classes', label: 'Clases', desc: 'Programación de clases grupales' },
  { id: 'trainers', icon: 'trainers', label: 'Entrenadores', desc: 'Staff y asignación de clientes' },
  { id: 'reports', icon: 'reports', label: 'Reportes', desc: 'Indicadores y análisis del negocio' },
];

/* Descripción de cada módulo base (los metas no llevan `desc`). */
const CORE_DESC = {
  dashboard: 'Panel principal del día',
  members: 'Registro y estados de membresías',
  calendar: 'Agenda y eventos',
  finance: 'Ingresos, egresos y caja',
  inventory: 'Productos, equipo y zona húmeda',
  settings: 'Configuración del sistema',
};

export default function ModulesSection() {
  const { flags, toggleModule } = useModules();
  const coreModules = MODULES.filter((m) => m.core);

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Módulos opcionales" subtitle="Actívalos para mostrarlos en la barra de navegación">
        {OPTIONAL.map((m) => {
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
                <span className={shared.rowDesc}>{m.desc}</span>
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
              <span className={styles.coreDesc}>{CORE_DESC[m.id] || ''}</span>
            </div>
            <span className={styles.check}><Icon name="check" /></span>
          </div>
        ))}
      </SettingsCard>
    </div>
  );
}
