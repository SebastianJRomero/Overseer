/*
  AppearanceSection — Ajustes → Apariencia.

  Los tres ejes de tema del prototipo, ahora dentro de la app: acento (con
  muestra de color), densidad y bordes. Escribe directo en ThemeProvider
  (useTheme.setAppearance), que estampa data-* en <html> y persiste — todo
  el sistema reacciona al instante.

  No usa useSettings: el tema es un contexto global, no un service local.
*/

import { useTheme } from '../../../theme/ThemeProvider';
import SegmentedOptions from '../../../components/SegmentedOptions/SegmentedOptions';
import SettingsCard from './SettingsCard';
import styles from './AppearanceSection.module.css';

/* Gradiente de cada acento (fijo para pintar la muestra sin depender del
   acento activo). Coinciden con accents.css. */
const ACCENTS = [
  { value: 'coral', label: 'Coral', grad: 'linear-gradient(150deg,#ff5c38,#ff2d78)' },
  { value: 'electrico', label: 'Eléctrico', grad: 'linear-gradient(150deg,#8df25a,#22c69a)' },
  { value: 'oceano', label: 'Océano', grad: 'linear-gradient(150deg,#3aa4ff,#2d63ff)' },
  { value: 'purpura', label: 'Púrpura', grad: 'linear-gradient(150deg,#a24bff,#ff2db4)' },
];

const DENSITY = [
  { value: 'compacto', label: 'Compacto' },
  { value: 'comodo', label: 'Cómodo' },
  { value: 'espacioso', label: 'Espacioso' },
];

const ROUNDNESS = [
  { value: 'nitido', label: 'Nítido' },
  { value: 'redondeado', label: 'Redondeado' },
  { value: 'suave', label: 'Suave' },
];

export default function AppearanceSection() {
  const { accent, density, roundness, setAppearance } = useTheme();

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Color de acento" subtitle="Tiñe botones, selecciones y el logotipo">
        <div className={styles.accentGrid}>
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              className={a.value === accent ? `${styles.accent} ${styles.accentOn}` : styles.accent}
              onClick={() => setAppearance({ accent: a.value })}
            >
              <span className={styles.swatch} style={{ background: a.grad }} />
              <span className={styles.accentLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Densidad" subtitle="Cuánto aire hay entre los elementos">
        <div className={styles.control}>
          <SegmentedOptions options={DENSITY} value={density} onChange={(v) => setAppearance({ density: v })} columns={3} />
        </div>
      </SettingsCard>

      <SettingsCard title="Bordes" subtitle="Qué tan redondeadas se ven las esquinas">
        <div className={styles.control}>
          <SegmentedOptions options={ROUNDNESS} value={roundness} onChange={(v) => setAppearance({ roundness: v })} columns={3} />
        </div>
      </SettingsCard>
    </div>
  );
}
