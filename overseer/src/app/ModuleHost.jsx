/*
  ModuleHost — Monta el módulo activo según el registry.

  Es deliberadamente tonto: busca el meta por id y renderiza su Component.
  No conoce ningún módulo por nombre — por eso agregar/quitar módulos nunca
  toca este archivo (ARQUITECTURA §4).

  El `key={meta.id}` es importante: obliga a React a desmontar y volver a
  montar al cambiar de módulo, lo que re-dispara la animación de entrada
  `moduleIn` que cada módulo trae en su contenedor.
*/

import { useModules } from '../context/ModulesProvider';
import { getModule } from './moduleRegistry';
import EmptyState from '../components/EmptyState/EmptyState';

export default function ModuleHost() {
  const { active } = useModules();
  const meta = getModule(active);

  // id desconocido (módulo quitado del registry con la app abierta):
  // no romper — mostrar un vacío amable.
  if (!meta) {
    return <EmptyState>Este módulo no está disponible.</EmptyState>;
  }

  const Component = meta.Component;
  return <Component key={meta.id} />;
}
