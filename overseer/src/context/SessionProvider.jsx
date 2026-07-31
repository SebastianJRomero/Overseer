/*
  SessionProvider — Estado global de la sesión (quién está logueado).

  Expone:
    - status: 'cargando' | 'anonimo' | 'autenticado'
        'cargando' existe porque recuperar la sesión recordada es async;
        App muestra un frame vacío en vez de parpadear el login.
    - user: nombre del usuario logueado (o null) — compat con toda la UI.
    - role: rol del usuario ('Admin' | 'Recepción' | ...) — para el gating.
    - isSuper: true si entró con la credencial maestra (superusuario global) —
      desbloquea el menú de mantenimiento aunque no exista ningún Admin.
    - userId: id de la cuenta (o null si es una sesión de demo sin cuenta).
    - account: la cuenta completa { id, nombre, email, rol } (o null).
    - justIn: true durante ~600 ms tras el login — AppShell lo usa para
      reproducir la animación de entrada `appEnter` SOLO al venir del login
      (no en cada recarga).
    - enter(cuenta) / logout().

  La validación de credenciales NO vive aquí: eso es de authService (contra el
  backend, que resuelve el rol). Este provider solo refleja el resultado.
*/

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as authService from '../services/authService';

const SessionContext = createContext(null);

export default function SessionProvider({ children }) {
  const [status, setStatus] = useState('cargando');
  const [account, setAccount] = useState(null); // { id, nombre, email, rol } | null
  const [justIn, setJustIn] = useState(false);
  const justInTimer = useRef(null);

  // Al arrancar: ¿había una sesión recordada?
  useEffect(() => {
    authService.getSession().then((session) => {
      if (session) {
        setAccount(session);
        setStatus('autenticado');
      } else {
        setStatus('anonimo');
      }
    });
    return () => clearTimeout(justInTimer.current);
  }, []);

  /** Marca la sesión como iniciada (LoginScreen ya validó con authService). */
  const enter = (cuenta) => {
    setAccount(cuenta);
    setStatus('autenticado');
    // Ventana corta para que el shell entre con appEnter y luego se limpia.
    setJustIn(true);
    clearTimeout(justInTimer.current);
    justInTimer.current = setTimeout(() => setJustIn(false), 600);
  };

  const logout = async () => {
    await authService.logout();
    setAccount(null);
    setStatus('anonimo');
  };

  return (
    <SessionContext.Provider value={{
      status,
      user: account?.nombre ?? null, // compat: la UI usa `user` como el nombre
      role: account?.rol ?? null,
      isSuper: account?.super ?? false,
      userId: account?.id ?? null,
      account,
      justIn, enter, logout,
    }}
    >
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
