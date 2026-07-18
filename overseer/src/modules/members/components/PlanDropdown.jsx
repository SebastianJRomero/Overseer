/*
  PlanDropdown — Selector de plan de la ficha (campo + menú emergente).

  Réplica del dropdown "Membresía" del prototipo: el campo muestra el plan
  actual con un caret que gira al abrir; el menú lista los planes con su
  punto de color y un check en el activo. Elegir guarda y cierra animado.

  Recibe:
    - value: plan actual ('1 mes', ...)
    - options: nombres de plan a ofrecer
    - onChange: (tipo) => void
*/

import usePopover from '../../../hooks/usePopover';
import { getPlanStyle } from '../memberStyles';
import styles from './PlanDropdown.module.css';

export default function PlanDropdown({ value, options, onChange }) {
  const popover = usePopover();

  const pick = (tipo) => {
    onChange(tipo);
    popover.close();
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={popover.isActive ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        onClick={popover.toggle}
      >
        <span>{value}</span>
        <span className={styles.caret} style={{ transform: popover.isActive ? 'rotate(180deg)' : 'none' }}>
          ⌄
        </span>
      </button>

      {popover.isOpen && (
        <div
          className={styles.menu}
          style={{
            animation: popover.isClosing
              ? 'pickerOut .15s ease forwards'
              : 'menuIn .18s cubic-bezier(.2,.9,.3,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((tipo) => {
            const active = tipo === value;
            return (
              <button
                key={tipo}
                type="button"
                className={active ? `${styles.option} ${styles.optionActive}` : styles.option}
                onClick={() => pick(tipo)}
              >
                <span className={styles.dot} style={{ background: getPlanStyle(tipo).color }} />
                <span className={styles.optionLabel}>{tipo}</span>
                <span className={styles.check} style={{ opacity: active ? 1 : 0 }}>✓</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
