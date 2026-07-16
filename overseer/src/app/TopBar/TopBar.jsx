/*
  TopBar — Barra superior del shell.

  Composición (de izquierda a derecha, como el prototipo):
    marca OVERSEER · tabs de módulos (centrados) · reloj · avatar.

  Este componente solo ORQUESTA: las piezas viven en TopBarTabs, TopBarClock
  y (en la Fase 1) UserMenu. El avatar es estático hasta que exista sesión.
*/

import TopBarTabs from './TopBarTabs';
import TopBarClock from './TopBarClock';
import Avatar from '../../components/Avatar/Avatar';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <header className={styles.bar}>
      {/* Marca: cubo con gradiente de acento + wordmark */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span className={styles.logoLetter}>O</span>
        </div>
        <span className={styles.wordmark}>OVERSEER</span>
      </div>

      <TopBarTabs />

      <div className={styles.right}>
        <TopBarClock />
        <span className={styles.divider} />
        {/* Fase 1 conectará el usuario real y el menú de cuenta. */}
        <Avatar name="Admin" size={30} accent />
      </div>
    </header>
  );
}
