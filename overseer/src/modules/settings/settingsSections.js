/*
  modules/settings/settingsSections.js — Registro de sub-secciones de Ajustes.

  Mismo patrón que moduleRegistry / inventoryTabs / widgets (ARQUITECTURA §4):
  la navegación de Ajustes se construye MAPEANDO este array, sin condicionales.
  Agregar una sección = crear su componente + una línea aquí.

  Cada sección se auto-describe: { id, icon, label, desc, Component }. El
  Component recibe por props el objeto de useSettings (SettingsModule).

  Nota: "Apariencia" no existía en el prototipo como sección in-app (el theming
  se controlaba desde el panel de la herramienta de diseño); aquí se construye
  como sección real conectada a ThemeProvider (decisión #2 del proyecto).
*/

import GeneralSection from './components/GeneralSection';
import AppearanceSection from './components/AppearanceSection';
import ModulesSection from './components/ModulesSection';
import AccountsSection from './components/AccountsSection';
import PlansSection from './components/PlansSection';
import NotificationsSection from './components/NotificationsSection';
import DataSection from './components/DataSection';

export const SETTINGS_SECTIONS = [
  { id: 'general', icon: 'brand', label: 'Datos del gimnasio', desc: 'Nombre, contacto y horarios', Component: GeneralSection },
  { id: 'apariencia', icon: 'appearance', label: 'Apariencia', desc: 'Acento, densidad y bordes', Component: AppearanceSection },
  { id: 'modulos', icon: 'grid', label: 'Módulos', desc: 'Activar o desactivar módulos', Component: ModulesSection },
  { id: 'cuentas', icon: 'members', label: 'Cuentas y roles', desc: 'Admin, recepción y permisos', Component: AccountsSection },
  { id: 'planes', icon: 'finance', label: 'Planes y precios', desc: 'Membresías y tarifas', Component: PlansSection },
  { id: 'notificaciones', icon: 'notification', label: 'Notificaciones', desc: 'Recordatorios y avisos', Component: NotificationsSection },
  { id: 'datos', icon: 'reports', label: 'Respaldos y datos', desc: 'Exportar y copias de seguridad', Component: DataSection },
];

/** Sección por defecto (la primera del registro). */
export const DEFAULT_SECTION = SETTINGS_SECTIONS[0].id;
