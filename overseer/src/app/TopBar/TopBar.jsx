/*
  TopBar — Barra superior del shell.

  Composición (de izquierda a derecha, como el prototipo):
    marca OVERSEER · tabs de módulos (centrados) · reloj · cuenta.

  Este componente solo ORQUESTA: las piezas viven en TopBarTabs,
  TopBarClock y UserMenu (avatar + popover de cuenta).
*/

import TopBarTabs from './TopBarTabs';
import TopBarClock from './TopBarClock';
import UserMenu from './UserMenu';
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
        <UserMenu />
      </div>
    </header>
  );
}
