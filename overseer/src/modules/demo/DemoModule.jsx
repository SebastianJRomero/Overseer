/*
  DemoModule — Módulo de demostración de la Fase 0.

  Replica el "EmptyModule" del prototipo: una tarjeta centrada que explica
  que aquí se montan los módulos. Sirve para dos cosas:
    1. Probar el ciclo completo registry → tabs → ModuleHost antes de que
       exista ningún módulo real.
    2. Ser la plantilla mínima de cómo se estructura un módulo.

  Se elimina cuando entre el primer módulo real (Fase 2) — borrar la carpeta
  y su línea en moduleRegistry.js, nada más (esa es la gracia del patrón).
*/

import styles from './demo.module.css';

export default function DemoModule() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>▦</div>
        <div className={styles.texts}>
          <span className={styles.title}>Área de módulos</span>
          <span className={styles.desc}>
            Cada módulo se monta y desmonta aquí sin tocar el resto del sistema.
          </span>
        </div>
        <span className={styles.code}>&lt;ModuleHost active="demo" /&gt;</span>
      </div>
    </div>
  );
}
