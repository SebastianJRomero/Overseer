/*
  SessionProvider — Estado global de la sesión (quién está logueado).

  Expone:
    - status: 'cargando' | 'anonimo' | 'autenticado'
        'cargando' existe porque recuperar la sesión recordada es async;
        App muestra un frame vacío en vez de parpadear el login.
    - user: nombre del usuario logueado (o null).
    - justIn: true durante ~600 ms tras el login — AppShell lo usa para
      reproducir la animación de entrada `appEnter` SOLO al venir del login
      (no en cada recarga).
    - login(user, remember) / logout() / switchUser().

  La validación de credenciales NO vive aquí: eso es de authService.
  Este provider solo refleja el resultado en React.
*/

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as authService from '../services/authService';

const SessionContext = createContext(null);

export default function SessionProvider({ children }) {
  const [status, setStatus] = useState('cargando');
  const [user, setUser] = useState(null);
  const [justIn, setJustIn] = useState(false);
  const justInTimer = useRef(null);

  // Al arrancar: ¿había una sesión recordada?
  useEffect(() => {
    authService.getSession().then((session) => {
      if (session) {
        setUser(session.user);
        setStatus('autenticado');
      } else {
        setStatus('anonimo');
      }
    });
    return () => clearTimeout(justInTimer.current);
  }, []);

  /** Marca la sesión como iniciada (LoginScreen ya validó con authService). */
  const enter = (userName) => {
    setUser(userName);
    setStatus('autenticado');
    // Ventana corta para que el shell entre con appEnter y luego se limpia.
    setJustIn(true);
    clearTimeout(justInTimer.current);
    justInTimer.current = setTimeout(() => setJustIn(false), 600);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setStatus('anonimo');
  };

  // En el prototipo "cambiar de usuario" y "cerrar sesión" hacen lo mismo
  // (volver al login); se mantienen separados porque con auth real el
  // switch podría conservar la lista de cuentas del dispositivo.
  const switchUser = logout;

  return (
    <SessionContext.Provider value={{ status, user, justIn, enter, logout, switchUser }}>
      {children}
    </SessionContext.Provider>
  );
}

/** Hook de consumo: const { user, logout } = useSession(); */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
