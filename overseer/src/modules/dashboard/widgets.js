/*
  modules/dashboard/widgets.js — Registro de widgets del Inicio.

  Mismo patrón que moduleRegistry, un nivel más abajo (ARQUITECTURA §4):
  el Inicio no dibuja una lista fija de paneles, sino que MAPEA este array.
  Agregar un widget = crear su componente + una línea aquí; quitarlo = borrar
  la línea (el layout se reacomoda solo). Reordenar = mover la línea.

  Cada widget se auto-describe:
    { id, column: 'main' | 'side', Component }

  - 'main' = columna ancha izquierda · 'side' = columna angosta derecha.
  - Todos los widgets reciben las MISMAS props (el "contexto" que arma
    DashboardModule) y cada uno toma lo que necesita. Así un widget nuevo no
    obliga a tocar el contenedor.
*/

import DayMovements from './components/DayMovements';
import ExpiringMembers from './components/ExpiringMembers';
import UpcomingEvents from './components/UpcomingEvents';

export const WIDGETS = [
  { id: 'dayMovements', column: 'main', Component: DayMovements },
  { id: 'expiring', column: 'side', Component: ExpiringMembers },
  { id: 'upcomingEvents', column: 'side', Component: UpcomingEvents },
];

/** Widgets de una columna, en el orden del registro. */
export function widgetsOf(column) {
  return WIDGETS.filter((w) => w.column === column);
}
