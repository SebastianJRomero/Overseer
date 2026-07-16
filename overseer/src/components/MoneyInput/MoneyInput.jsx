/*
  MoneyInput — Campo de dinero con formato colombiano EN VIVO.

  Pedido explícito del cliente: al escribir 12000 el campo muestra
  "$ 12.000" al instante (punto de miles, estilo es-CO). Cómo funciona:

    1. El usuario teclea → limpiamos todo lo que no sea dígito (parseMoney).
    2. Guardamos el NÚMERO limpio en el estado del padre (onChange(numero)).
    3. Lo que se PINTA en el input es el número formateado con puntos
       (formatThousands). El "$" es un prefijo fijo fuera del texto editable.

  Es decir: el estado siempre tiene 12000 (número) y el ojo siempre ve
  "$ 12.000". Nadie más en la app tiene que pensar en formato.

  Recibe:
    - value: number | null  (null = campo vacío)
    - onChange: (number|null) => void
    - placeholder: texto cuando está vacío (por defecto "0")
*/

import { formatThousands, parseMoney } from '../../lib/money';
import styles from './MoneyInput.module.css';

export default function MoneyInput({ value, onChange, placeholder = '0' }) {
  // Valor visible: número → "12.000"; vacío → '' (para que se vea el placeholder).
  const display = value === null || value === undefined || value === '' ? '' : formatThousands(value);

  const handleInput = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    // Campo vacío → null (distinto de 0: "no escribió nada" ≠ "escribió cero").
    onChange(digits === '' ? null : parseMoney(digits));
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.prefix}>$</span>
      <input
        className={styles.input}
        value={display}
        onChange={handleInput}
        placeholder={placeholder}
        inputMode="numeric"
      />
    </div>
  );
}
