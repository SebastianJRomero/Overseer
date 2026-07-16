/*
  AppShell — Layout de la app autenticada: TopBar arriba + área de módulo.

  El área central lleva el gradiente radial coral sutil del prototipo y una
  animación de swap (screenA/screenB) que se re-dispara al cambiar de módulo
  — ver el porqué del truco A/B en hooks/useSwapAnimation.js.
*/

import TopBar from './TopBar/TopBar';
import ModuleHost from './ModuleHost';
import { useModules } from '../context/ModulesProvider';
import { useSession } from '../context/SessionProvider';
import useSwapAnimation from '../hooks/useSwapAnimation';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { active } = useModules();
  const { justIn } = useSession();
  // Al cambiar de módulo, el <main> entero hace una micro-transición de zoom.
  const mainAnim = useSwapAnimation(active, ['screenA', 'screenB'], '.42s');

  return (
    // appEnter solo al venir del login (justIn), no en cada recarga.
    <div className={styles.shell} style={justIn ? { animation: 'appEnter .45s ease both' } : undefined}>
      <TopBar />
      <main className={styles.main} style={{ animation: mainAnim }}>
        <ModuleHost />
      </main>
    </div>
  );
}
