/*
  AppShell — Layout de la app autenticada: TopBar arriba + área de módulo.

  El área central lleva el gradiente radial coral sutil del prototipo y una
  animación de swap (screenA/screenB) que se re-dispara al cambiar de módulo
  — ver el porqué del truco A/B en hooks/useSwapAnimation.js.
*/

import TopBar from './TopBar/TopBar';
import ModuleHost from './ModuleHost';
import { useModules } from '../context/ModulesProvider';
import useSwapAnimation from '../hooks/useSwapAnimation';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { active } = useModules();
  // Al cambiar de módulo, el <main> entero hace una micro-transición de zoom.
  const mainAnim = useSwapAnimation(active, ['screenA', 'screenB'], '.42s');

  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main} style={{ animation: mainAnim }}>
        <ModuleHost />
      </main>
    </div>
  );
}
