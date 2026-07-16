# Prompt para arrancar en Claude Code

Copia y pega este mensaje como **primer prompt** en Claude Code (con Fable 5), teniendo esta carpeta
abierta como contexto del proyecto. El objetivo del primer paso es **analizar y planear — NO escribir
código todavía**.

---

## Prompt de arranque (pégalo tal cual)

```
Vas a reconstruir un prototipo de diseño como una app real. Antes de escribir NADA de código,
quiero un análisis y un plan que aprobaré yo.

Contexto en esta carpeta:
- README.md — qué es la app, pantallas, design tokens, modelo de datos.
- ARQUITECTURA.md — REGLAS DE CÓDIGO OBLIGATORIAS. Léelas completas y respétalas al pie de la letra.
- prototipo/Gym Dashboard Final V1.dc.html — el prototipo (fuente de verdad visual e interactiva).
  Está escrito en un runtime propio (support.js). NO copies su sintaxis; se reconstruye en React.

Requisitos innegociables (ver ARQUITECTURA.md):
- Vite + React, JavaScript puro (sin TypeScript), CSS puro con CSS Modules.
- Sin librerías externas salvo necesidad real: si crees que hace falta una, PÁRATE, explícame por qué
  no es viable a mano, propón la opción, y ESPERA mi aprobación. No instales nada por tu cuenta.
- Todo bien comentado, pensado para que un junior aprenda leyéndolo (comenta el POR QUÉ).
- Modularidad total: cada pieza debe poder agregarse, quitarse, reemplazarse, ocultarse y reutilizarse
  sin afectar a las demás (usa el patrón de moduleRegistry descrito en ARQUITECTURA.md §4).
- Nada de componentes gigantes (~150 líneas guía; extrae sub-componentes).

TAREA DE ESTE PRIMER PASO (solo análisis, sin código):
1. Lee el prototipo completo e inventaría: módulos, sub-vistas, componentes reutilizables que se repiten,
   modales, estados y reglas de negocio (vencimientos, festivos, presets de renovación, cierre diferido
   de modales, theming accent/density/roundness, flags de módulos).
2. Propón la estructura de carpetas concreta siguiendo ARQUITECTURA.md, listando archivos por módulo.
3. Propón el contrato de "meta" de módulo y el moduleRegistry, y cómo TopBar/Dock/ModuleHost derivan de él.
4. Identifica los design tokens a centralizar en theme.css y los temas de acento conmutables.
5. Define la capa services/ (mock hoy → API mañana) y su interfaz por entidad.
6. Entrégame un PLAN DE MIGRACIÓN por fases, módulo por módulo, empezando por:
   Fase 0: andamiaje (Vite, theme.css, componentes base, shell vacío, moduleRegistry con 1 módulo dummy).
   Luego un módulo vertical completo como referencia de patrón (propón cuál y por qué).
   Luego el resto siguiendo ese patrón.

NO escribas código ni crees archivos todavía. Muéstrame el análisis y el plan. Cuando lo apruebe,
avanzamos FASE POR FASE, y al terminar cada fase paras para que yo revise.
```

---

## Cómo seguir después del plan

- Revisa el plan. Ajusta lo que no te cuadre (nombres, orden de módulos, qué es núcleo vs opcional).
- Aprueba **Fase 0** primero (andamiaje) y verifica que arranca (`npm run dev`).
- Pídele **un módulo completo** como referencia (sugerencia: `members`, es el más rico: tabla, ficha,
  wizard, filtros — sienta el patrón para el resto).
- De ahí en adelante: **un módulo por mensaje**, revisando entre cada uno.
- Recuérdale, si hace falta: "sin librerías nuevas sin preguntar", "comenta para junior",
  "no me hagas componentes gigantes".

## Recordatorio de fidelidad
Cuando implemente cada pantalla, pídele que **compare contra el prototipo** (puede abrir el `.dc.html`)
y ajuste colores, espaciados y animaciones a los tokens del README. La fidelidad visual es alta.
