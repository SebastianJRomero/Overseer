/*
  ModulesProvider — Estado global de navegación y visibilidad de módulos.

  Guarda dos cosas:
    - active: id del módulo que se está viendo (un solo string, como el
      prototipo — no hay router, ver decisión en el plan §7.4).
    - flags:  qué módulos OPCIONALES están visibles (Ajustes → Módulos).

  Regla de negocio importante (del prototipo): si apagas el módulo que está
  activo en pantalla, la app te devuelve a 'dashboard' — nunca te quedas
  mirando un módulo oculto.

  Los flags se persisten vía settingsService para sobrevivir recargas.
*/

import { createContext, useContext, useEffect, useState } from 'react';
import * as settingsService from '../services/settingsService';
import { DEFAULT_MODULE_ID, canAccessModule } from '../app/moduleRegistry';
import { useSession } from './SessionProvider';

const ModulesContext = createContext(null);

export default function ModulesProvider({ children }) {
  const [active, setActive] = useState(DEFAULT_MODULE_ID);
  const [flags, setFlags] = useState({});
  const { isSuper, role, permisos } = useSession();

  // Cargar los flags guardados al arrancar.
  useEffect(() => {
    settingsService.getModuleFlags().then(setFlags);
  }, []);

  // Enforcement (Tramo C): si el módulo activo deja de ser accesible para la
  // sesión (p. ej. al iniciar sesión con un rol sin permiso, o si cambian los
  // permisos), volver a Inicio — nunca dejar a la vista un módulo prohibido.
  useEffect(() => {
    if (!canAccessModule(active, { isSuper, role, permisos })) {
      setActive(DEFAULT_MODULE_ID);
    }
  }, [active, isSuper, role, permisos]);

  /** Enciende/apaga un módulo opcional (y aplica la regla de "volver a Inicio"). */
  const toggleModule = async (id) => {
    const next = await settingsService.setModuleFlag(id, flags[id] === false);
    setFlags(next);
    // Si acabo de OCULTAR el módulo que estoy viendo → volver a Inicio.
    if (next[id] === false && active === id) {
      setActive(DEFAULT_MODULE_ID);
    }
  };

  return (
    <ModulesContext.Provider value={{ active, setActive, flags, toggleModule }}>
      {children}
    </ModulesContext.Provider>
  );
}

/** Hook de consumo: const { active, setActive, flags } = useModules(); */
export function useModules() {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error('useModules debe usarse dentro de <ModulesProvider>');
  return ctx;
}
