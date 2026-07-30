/*
  LoginScreen — Pantalla de acceso (antes del shell).

  Flujo (fiel al prototipo, con salida simplificada):
    1. Formulario: usuario + contraseña (con Ver/Ocultar) + "Recordarme".
    2. Campos vacíos al enviar → caja de error con animación `shake`.
    3. Credenciales válidas → fase 'celebrando': la tarjeta se retira con
       un fundido suave (`cardAway`) y aparece la confirmación minimalista
       (LoginCelebration: halo + check dibujado + saludo).
    4. Tras la confirmación → fase 'saliendo' (fundido `loginFade`) y se
       avisa a SessionProvider (enter) para montar el shell con `appEnter`.

  La validación real la hace authService (mock: no vacíos). Aquí solo se
  orquesta la UI; la celebración vive en su propio componente.
*/

import { useRef, useState } from 'react';
import * as authService from '../services/authService';
import { useSession } from '../context/SessionProvider';
import LoginCelebration from './LoginCelebration';
import styles from './LoginScreen.module.css';

/* Tiempos de la coreografía de salida (ver keyframes en index.css).
   Cortos a propósito: la confirmación saluda y despeja el camino. */
const CELEBRATION_MS = 1100; // confirmación en pantalla antes del fundido
const FADE_MS = 450;         // duración de loginFade

export default function LoginScreen() {
  const { enter } = useSession();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState('formulario'); // formulario | celebrando | saliendo
  const [account, setAccount] = useState(null);      // cuenta devuelta por el backend
  const timers = useRef([]);

  const submit = async () => {
    if (phase !== 'formulario') return; // guard: ya estamos saliendo
    const result = await authService.login({ user, pass, remember });
    if (!result.ok) {
      setError(true);
      return;
    }
    // Coreografía: celebrar → fundir → entrar al shell.
    setAccount(result.user);
    setPhase('celebrando');
    timers.current.push(setTimeout(() => setPhase('saliendo'), CELEBRATION_MS));
    timers.current.push(setTimeout(() => enter(result.user), CELEBRATION_MS + FADE_MS));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') submit();
  };

  const overlayAnim = phase === 'saliendo' ? 'loginFade .45s ease forwards' : 'ovIn .3s ease';
  const cardAnim =
    phase === 'formulario'
      ? 'loginRise .55s cubic-bezier(.2,.8,.25,1) both'
      : 'cardAway .5s ease both';

  return (
    <div className={styles.overlay} style={{ animation: overlayAnim }}>
      {/* orbes ambientales decorativos */}
      <div className={styles.orbA} />
      <div className={styles.orbB} />

      <div className={styles.card} style={{ animation: cardAnim }}>
        {/* marca */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoLetter}>O</span>
          </div>
          <div className={styles.brandTexts}>
            <span className={styles.welcome}>Bienvenido de nuevo</span>
            <span className={styles.subtitle}>
              Ingresa a tu panel <em className={styles.wordmark}>OVERSEER</em>
            </span>
          </div>
        </div>

        {/* usuario */}
        <div className={styles.fieldUser}>
          <span className={styles.fieldLabel}>USUARIO</span>
          <div className={error && !user.trim() ? `${styles.inputWrap} ${styles.inputError}` : styles.inputWrap}>
            <span className={styles.fieldIcon}>◐</span>
            <input
              className={styles.input}
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(false); }}
              onKeyDown={onKeyDown}
              placeholder="tu.usuario"
              autoFocus
            />
          </div>
        </div>

        {/* contraseña */}
        <div className={styles.fieldPass}>
          <span className={styles.fieldLabel}>CONTRASEÑA</span>
          <div className={error && !pass ? `${styles.inputWrap} ${styles.inputError}` : styles.inputWrap}>
            <span className={styles.fieldIcon}>✳</span>
            <input
              className={`${styles.input} ${styles.inputPass}`}
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              onKeyDown={onKeyDown}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
            />
            <button type="button" className={styles.passToggle} onClick={() => setShowPass(!showPass)}>
              {showPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>✕</span>
            <span>Ingresa tu usuario y contraseña.</span>
          </div>
        )}

        {/* opciones */}
        <div className={styles.options}>
          <label className={styles.remember}>
            <span
              className={remember ? `${styles.checkbox} ${styles.checkboxOn}` : styles.checkbox}
              onClick={() => setRemember(!remember)}
            >
              {remember ? '✓' : ''}
            </span>
            <span className={styles.rememberText}>Recordarme</span>
          </label>
          <a href="#" className={styles.forgot} onClick={(e) => e.preventDefault()}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* ingresar */}
        <button type="button" className={styles.submit} onClick={submit}>
          <span>Ingresar</span>
          <span className={styles.submitArrow}>→</span>
        </button>

        <div className={styles.footer}>Panel de administración · Acceso restringido</div>
      </div>

      {phase !== 'formulario' && <LoginCelebration userName={account?.nombre || user.trim()} />}
    </div>
  );
}
