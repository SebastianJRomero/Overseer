/*
  modules/settings/settingsSections.js — Registro de sub-secciones de Ajustes.

  Mismo patrón que moduleRegistry / inventoryTabs / widgets (ARQUITECTURA §4):
  la navegación de Ajustes se construye MAPEANDO este array, sin condicionales.
  Agregar una sección = crear su componente + una línea aquí.

  Cada sección se auto-describe: { id, icon, label, desc, Component }. El
  Component recibe por props el objeto de useSettings (SettingsModule).

  Nota: el tema claro/oscuro NO vive aquí — se cambia con el toggle del menú de
  usuario (TopBar → Cuenta), que llama a ThemeProvider.setAppearance. Los demás
  ejes de tema (acento/densidad/bordes) quedan en sus valores por defecto del
  reskin; ya no se exponen como sección de Ajustes.
*/

import GeneralSection from './components/GeneralSection';
import ModulesSection from './components/ModulesSection';
import AccountsSection from './components/AccountsSection';
import PlansSection from './components/PlansSection';
import NotificationsSection from './components/NotificationsSection';
import DataSection from './components/DataSection';
import MaintenanceSection from './components/MaintenanceSection';

export const SETTINGS_SECTIONS = [
  { id: 'general', icon: 'brand', label: 'Datos del gimnasio', desc: 'Nombre, contacto y horarios', Component: GeneralSection },
  { id: 'modulos', icon: 'grid', label: 'Módulos', desc: 'Activar o desactivar módulos', Component: ModulesSection },
  { id: 'cuentas', icon: 'members', label: 'Cuentas y roles', desc: 'Admin, recepción y permisos', Component: AccountsSection },
  { id: 'planes', icon: 'finance', label: 'Planes y precios', desc: 'Membresías y tarifas', Component: PlansSection },
  { id: 'notificaciones', icon: 'notification', label: 'Notificaciones', desc: 'Recordatorios y avisos', Component: NotificationsSection },
  { id: 'datos', icon: 'reports', label: 'Respaldos y datos', desc: 'Exportar y copias de seguridad', Component: DataSection },
];

/*
  Sección OCULTA de mantenimiento (Tramo C · frente 5). No va en el array de
  arriba a propósito: no aparece en la sub-nav. SettingsModule la añade a la
  navegación SOLO cuando el atajo Ctrl+Shift+M la desbloquea y el usuario es
  SUPERUSUARIO (no basta el rol Admin: el login es permisivo). Se mantiene
  aparte para no exponerla por accidente.
*/
export const MAINTENANCE_SECTION = {
  id: 'mantenimiento', icon: 'key', label: 'Mantenimiento', desc: 'Zona avanzada · acceso restringido', Component: MaintenanceSection,
};

/** Sección por defecto (la primera del registro). */
export const DEFAULT_SECTION = SETTINGS_SECTIONS[0].id;
