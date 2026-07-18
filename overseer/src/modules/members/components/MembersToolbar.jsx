/*
  MembersToolbar — Cabecera del módulo: título, total, chips de estado,
  buscador y botón de alta.

  Los chips muestran el CONTEO por estado y al hacer clic abren el modal
  de filtro correspondiente (misma interacción del prototipo). El buscador
  filtra la tabla en vivo por nombre o cédula.

  Recibe:
    - total: número de miembros
    - counts: { activos, pronto, vencidos }
    - query / onQuery: texto del buscador (estado vive en el módulo)
    - onFilter: (clave) => void  — 'activos' | 'pronto' | 'vencidos'
    - onAdd: abrir el wizard de alta
*/

import Button from '../../../components/Button/Button';
import styles from './MembersToolbar.module.css';

/* Definición de los 3 chips: clave de filtro, etiqueta y color. */
const CHIPS = [
  { key: 'activos', label: 'activos', color: 'var(--ok)', bg: 'var(--ok-bg)', border: 'var(--ok-border)' },
  { key: 'pronto', label: 'vencen pronto', color: 'var(--warn)', bg: 'var(--warn-bg)', border: '#3a3020' },
  { key: 'vencidos', label: 'vencidos', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
];

export default function MembersToolbar({ total, counts, query, onQuery, onFilter, onAdd }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.heading}>
        <span className={styles.title}>Miembros</span>
        <span className={styles.total}>{total} en total</span>
      </div>

      <div className={styles.chips}>
        {CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={styles.chip}
            style={{ background: chip.bg, borderColor: chip.border }}
            onClick={() => onFilter(chip.key)}
          >
            <span className={styles.chipDot} style={{ background: chip.color }} />
            <span className={styles.chipCount} style={{ color: chip.color }}>{counts[chip.key]}</span>
            <span className={styles.chipLabel}>{chip.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.search}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Filtrar…"
        />
      </div>

      <Button onClick={onAdd}>＋ Agregar</Button>
    </div>
  );
}
