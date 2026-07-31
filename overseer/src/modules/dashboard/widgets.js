/*
  modules/dashboard/widgets.js — Registro de widgets del Inicio.

  Mismo patrón que moduleRegistry, un nivel más abajo (ARQUITECTURA §4):
  el Inicio no dibuja una lista fija de paneles, sino que MAPEA este array.
  Agregar un widget = crear su componente + una línea aquí; quitarlo = borrar
  la línea (el layout se reacomoda solo). Reordenar = mover la línea.

  Cada widget se auto-describe:
    { id, column: 'main' | 'side', need?, Component }

  - 'main' = columna ancha izquierda · 'side' = columna angosta derecha.
  - `need` (opcional) = FUNCIÓN de acceso que el widget exige (las de
    rolePermissions/usersService). Si el usuario no la tiene, el widget no se
    dibuja (enforcement de permisos en el Inicio, Tramo C). El Admin/super ven
    todo. Sin `need` = siempre visible.
  - Todos los widgets reciben las MISMAS props (el "contexto" que arma
    DashboardModule) y cada uno toma lo que necesita. Así un widget nuevo no
    obliga a tocar el contenedor.
*/

import { hasPermission } from '../../app/moduleRegistry';
import DayMovements from './components/DayMovements';
import ExpiringMembers from './components/ExpiringMembers';
import UpcomingEvents from './components/UpcomingEvents';

export const WIDGETS = [
  { id: 'dayMovements', column: 'main', need: 'Finanzas', Component: DayMovements },
  { id: 'expiring', column: 'side', need: 'Miembros', Component: ExpiringMembers },
  { id: 'upcomingEvents', column: 'side', need: 'Calendario', Component: UpcomingEvents },
];

/**
 * Widgets de una columna, en el orden del registro, filtrados por permiso.
 * @param {string} column   'main' | 'side'
 * @param {{isSuper?, role?, permisos?}|null} sess   sesión; null = sin filtro
 */
export function widgetsOf(column, sess = null) {
  return WIDGETS.filter((w) => w.column === column
    && (!sess || !w.need || hasPermission(sess, w.need)));
}
