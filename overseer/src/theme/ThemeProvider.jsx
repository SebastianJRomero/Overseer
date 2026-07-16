/*
  ThemeProvider.jsx — Contexto de apariencia (acento · densidad · redondez).

  Qué hace:
    1. Carga la apariencia guardada (via settingsService) al arrancar.
    2. Estampa data-accent / data-density / data-roundness en <html>;
       theme.css y accents.css reaccionan a esos atributos con variables CSS.
    3. Expone setAppearance() para que Ajustes → Apariencia cambie el tema.

  ¿Por qué atributos en <html> y no clases en un div? Porque las variables
  CSS definidas en :root aplican a TODO (modales incluidos, aunque se
  rendericen en otra rama del árbol) y el CSS queda declarativo.
*/

import { createContext, useContext, useEffect, useState } from 'react';
import * as settingsService from '../services/settingsService';

const ThemeContext = createContext(null);

/** Valores iniciales mientras carga lo guardado (defaults del prototipo). */
const INITIAL = { accent: 'coral', density: 'comodo', roundness: 'redondeado' };

export default function ThemeProvider({ children }) {
  const [appearance, setAppearanceState] = useState(INITIAL);

  // Al montar: recuperar lo que el usuario dejó configurado la última vez.
  useEffect(() => {
    settingsService.getAppearance().then(setAppearanceState);
  }, []);

  // Cada vez que cambia la apariencia, la estampamos en <html>.
  // El CSS hace el resto — ningún componente conoce los colores concretos.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.accent = appearance.accent;
    html.dataset.density = appearance.density;
    html.dataset.roundness = appearance.roundness;
  }, [appearance]);

  /**
   * Cambia uno o varios ejes y persiste.
   * Ej: setAppearance({ accent: 'oceano' })
   */
  const setAppearance = async (patch) => {
    const next = await settingsService.setAppearance(patch);
    setAppearanceState(next);
  };

  return (
    <ThemeContext.Provider value={{ ...appearance, setAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook de consumo: const { accent, setAppearance } = useTheme(); */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
