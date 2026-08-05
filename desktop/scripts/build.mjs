/*
  scripts/build.mjs — Compila la app de escritorio.

  Pasos:
  1. `npm run build` en ../overseer (Vite → ../overseer/dist).
  2. Empaqueta el server (server/src/index.js) en UN solo archivo CJS con
     esbuild, dejando `better-sqlite3` externo (módulo nativo: se instala y
     recompila para Electron desde node_modules de desktop/).
  3. Copia el front compilado a ./web para que el server embebido lo sirva.

  Uso:  npm run build  (front + bundle)  →  npm run dist  (además empaqueta con
  electron-builder, sin publicar)  →  npm run dist:publish  (publica el release).
*/

import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const desk = join(root, 'desktop');
const overseer = join(root, 'overseer');
const server = join(root, 'server');

// 1. Frontend compilado (Vite).
console.log('[build] frontend (vite build)…');
execSync('npm run build', { cwd: overseer, stdio: 'inherit' });

// 2. Bundle del server en un solo CJS (mejor-sqlite3 queda externo). db.js
//    evita `import.meta.url` cuando Electron setea OVERSEER_DB_PATH.
console.log('[build] bundle del server…');
await build({
  entryPoints: [join(server, 'src', 'index.js')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['better-sqlite3'],
  outfile: join(desk, 'dist', 'server-bundle.cjs'),
  logLevel: 'warning',
});

// 3. Copia del front a ./web.
console.log('[build] copiando front a web/…');
await rm(join(desk, 'web'), { recursive: true, force: true });
await mkdir(join(desk, 'web'), { recursive: true });
await cp(join(overseer, 'dist'), join(desk, 'web'), { recursive: true });

console.log('[build] listo: desktop/web (front) + desktop/dist/server-bundle.cjs');
