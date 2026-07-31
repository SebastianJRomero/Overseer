/*
  ThemeProvider.jsx — Contexto de apariencia (tema · acento · densidad ·
  redondez · zoom).

  Qué hace:
    1. Carga la apariencia guardada (via settingsService) al arrancar.
    2. Estampa data-accent / data-density / data-roundness en <html>;
       theme.css y accents.css reaccionan a esos atributos con variables CSS.
    3. Aplica el ZOOM de la interfaz con la propiedad CSS `zoom` en <html>
       (control del menú de usuario). Se usa `zoom` y no `transform: scale`
       porque re-renderiza el texto a su tamaño real (sin desenfoque) y
       refluye el layout, así los modales caben sin scroll al reducir. Es una
       app solo-desktop (Chromium), donde `zoom` está soportado.
    4. Expone setAppearance() para que Ajustes → Apariencia cambie el tema.

  ¿Por qué atributos en <html> y no clases en un div? Porque las variables
  CSS definidas en :root aplican a TODO (modales incluidos, aunque se
  rendericen en otra rama del árbol) y el CSS queda declarativo.
*/

import { createContext, useContext, useEffect, useState } from 'react';
import * as settingsService from '../services/settingsService';

const ThemeContext = createContext(null);

/** Valores iniciales mientras carga lo guardado (defaults del prototipo). */
const INITIAL = { tema: 'oscuro', accent: 'coral', density: 'comodo', roundness: 'redondeado', zoom: 100 };

/** Zoom permitido (%). El slider del menú de usuario se mueve en este rango. */
export const ZOOM_MIN = 85;
export const ZOOM_MAX = 115;
const clampZoom = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(z) || 100));

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
    html.dataset.tema = appearance.tema;
    html.dataset.accent = appearance.accent;
    html.dataset.density = appearance.density;
    html.dataset.roundness = appearance.roundness;
    // Zoom de la interfaz: fracción para la propiedad CSS `zoom` (100 → '1').
    html.style.zoom = String(clampZoom(appearance.zoom) / 100);
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
