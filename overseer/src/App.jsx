/*
  App — Raíz de la aplicación.

  Responsabilidad única: montar los providers globales y decidir qué se ve.
  - ThemeProvider:   apariencia (acento/densidad/redondez) para TODO.
  - ModulesProvider: navegación y flags de módulos.

  En la Fase 1 se añadirá SessionProvider y la decisión login vs shell
  (hoy siempre se muestra el shell).
*/

import ThemeProvider from './theme/ThemeProvider';
import ModulesProvider from './context/ModulesProvider';
import AppShell from './app/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <ModulesProvider>
        <AppShell />
      </ModulesProvider>
    </ThemeProvider>
  );
}
