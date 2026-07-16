/*
  App — Raíz de la aplicación.

  Responsabilidad única: montar los providers globales y decidir qué se ve
  según la sesión (login o shell).
    - ThemeProvider:   apariencia (acento/densidad/redondez) para TODO
      (también tiñe el login, por eso envuelve a la sesión).
    - SessionProvider: quién está logueado.
    - ModulesProvider: navegación y flags de módulos (solo tiene sentido
      dentro del shell, pero es inofensivo montarlo siempre y simplifica).
*/

import ThemeProvider from './theme/ThemeProvider';
import SessionProvider, { useSession } from './context/SessionProvider';
import ModulesProvider from './context/ModulesProvider';
import LoginScreen from './auth/LoginScreen';
import AppShell from './app/AppShell';

/* Separado de App para poder leer el contexto de sesión (los hooks solo
   funcionan DENTRO del provider, no en el componente que lo monta). */
function Gate() {
  const { status } = useSession();

  // Recuperando la sesión recordada: un frame vacío evita el parpadeo
  // login→shell en usuarios con "Recordarme".
  if (status === 'cargando') return null;

  return status === 'autenticado' ? <AppShell /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ModulesProvider>
          <Gate />
        </ModulesProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
