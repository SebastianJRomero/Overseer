/*
  data/seedClasses.js — Clases grupales (mock).

  Módulo opcional "Clases". `inscritos`/`cupo` son números; la ocupación y el
  color de la barra se DERIVAN en el módulo (no se guardan). `color`/`bg` son
  una paleta CATEGÓRICA decorativa (una por clase) — hex explícitos a
  propósito, como los colores de una gráfica, no estados semánticos.

  Clase: { id, nombre, coach, dias, hora, inscritos, cupo, color, bg }
*/

export const SEED_CLASSES = [
  { id: 'cl-spinning', nombre: 'Spinning', coach: 'Camila Rojas', dias: 'Lun · Mié · Vie', hora: '06:00', inscritos: 20, cupo: 25, color: '#7fb1f5', bg: '#16233a' },
  { id: 'cl-crossfit', nombre: 'CrossFit', coach: 'Julián Mesa', dias: 'Lun a Vie', hora: '07:30', inscritos: 15, cupo: 18, color: '#ff8b6e', bg: '#241722' },
  { id: 'cl-yoga', nombre: 'Yoga', coach: 'Daniela Cruz', dias: 'Mar · Jue', hora: '09:00', inscritos: 12, cupo: 20, color: '#7ee2a0', bg: '#1a2a22' },
  { id: 'cl-zumba', nombre: 'Zumba', coach: 'Andrea Pineda', dias: 'Mié · Vie', hora: '18:00', inscritos: 28, cupo: 30, color: '#c6a0f5', bg: '#221b2e' },
  { id: 'cl-funcional', nombre: 'Funcional', coach: 'Julián Mesa', dias: 'Sábado', hora: '08:00', inscritos: 16, cupo: 22, color: '#ffb35c', bg: '#2a2417' },
  { id: 'cl-boxeo', nombre: 'Boxeo', coach: 'Marco Díaz', dias: 'Mar · Jue', hora: '19:00', inscritos: 10, cupo: 14, color: '#ff9d85', bg: '#2a1d29' },
];
