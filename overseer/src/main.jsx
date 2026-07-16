/*
  main.jsx — Punto de entrada de Vite.

  Solo hace dos cosas: cargar los estilos globales (reset + tokens +
  keyframes) y montar <App/> en el #root. StrictMode ayuda a detectar
  efectos mal escritos durante el desarrollo (monta los componentes dos
  veces a propósito) y no afecta al build de producción.
*/

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
