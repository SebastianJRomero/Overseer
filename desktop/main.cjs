/*
  main.cjs — Proceso principal de la app de escritorio OVERSEER.

  Hace tres cosas:
  1. Arranca el backend embebido (server-bundle.cjs) en un puerto fijo
     configurable (3100 por defecto; ver loadConfig), con la BD en
     %APPDATA%\OVERSEER\overseer.db y el front compilado servido desde ./web
     (misma ruta /api → el front usa URLs relativas). Puerto fijo = origen
     estable en Chromium → tema, sesión y flags persisten entre reinicios.
     El default (3100) no choca con el server de desarrollo (3001): si chocaran,
     la app caería a un puerto efímero y el celular no la alcanzaría.
  2. Abre la ventana apuntando a http://127.0.0.1:<puerto>/ e integra la bandeja
     del sistema (el icono de la app): cerrar la ventana la oculta, no cierra
     la app; se sale desde el menú de la bandeja.
  3. Auto-updater (electron-updater): cuando la app está empaquetada busca
     actualizaciones en el release de GitHub y ofrece reiniciar para aplicarla.
*/

const { app, BrowserWindow, Tray, Menu, nativeImage, dialog } = require('electron');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');

// Nombre estable de la app: fija el directorio de datos en %APPDATA%\OVERSEER.
// En vez de depender del `name` del package.json ("overseer-desktop"), que entre
// builds dejó DOS carpetas de datos (OVERSEER y overseer-desktop) con BDs
// distintas — la causa de que el celular viera datos distintos al PC.
app.setName('OVERSEER');

// Migración única: builds viejos guardaban la BD en %APPDATA%\overseer-desktop.
// Si la copia canónica (%APPDATA%\OVERSEER) no existe o es más vieja, tomamos
// la más reciente (con sus WAL/SHM) para no perder datos al unificar carpetas.
function migrateOldDataDir() {
  const canonical = path.join(app.getPath('userData'), 'overseer.db');
  const old = path.join(app.getPath('appData'), 'overseer-desktop', 'overseer.db');
  if (!fs.existsSync(old)) return;
  const mtime = (p) => { try { return fs.statSync(p).mtimeMs; } catch { return -1; } };
  if (mtime(canonical) >= mtime(old)) return;
  for (const suffix of ['', '-wal', '-shm']) {
    const src = old + suffix, dst = canonical + suffix;
    if (fs.existsSync(src)) fs.copyFileSync(src, dst);
  }
}
migrateOldDataDir();

// ── Configuración que el server embebido lee al cargar ────────────────────
// La BD vive en los datos del usuario (no en la carpeta de instalación, que
// es de solo lectura tras instalarse). El front compilado está en ./web.
process.env.OVERSEER_DB_PATH = path.join(app.getPath('userData'), 'overseer.db');
process.env.OVERSEER_STATIC_DIR = path.join(__dirname, 'web');

/**
 * Config del usuario: %APPDATA%\OVERSEER\config.json  (overrides: env).
 *   { "port": 3100, "host": "0.0.0.0" }
 * - host "0.0.0.0" → accesible desde la red local (móvil/otros PCs). Para
 *   quedarse solo en la máquina, usar "127.0.0.1".
 *
 * ¿Por qué puerto FIJO? El front guarda tema, sesión y flags de módulos en
 * localStorage, y localStorage en Chromium es POR-ORIGEN (host+puerto). Con
 * puerto efímero, cada reinicio cambiaba el origen: el tema volvía a oscuro,
 * había que volver a iniciar sesión y se perdían los flags. Puerto estable =
 * origen estable = las preferencias persisten entre cierres.
 *
 * El default es 3100 a propósito: el server de desarrollo usa 3001, y si la
 * app de escritorio tomara el mismo puerto caería a uno efímero (origen
 * inestable y a veces inalcanzable desde el celular).
 */
function loadConfig() {
  let cfg = {};
  const cfgPath = path.join(app.getPath('userData'), 'config.json');
  try {
    // `replace` inicial: tolera BOM (p. ej. archivos guardados con PowerShell).
    cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^\uFEFF/, ''));
  } catch { /* sin config → defaults */ }
  return {
    port: Number(process.env.OVERSEER_PORT || cfg.port || 3100),
    host: process.env.OVERSEER_HOST || cfg.host || '0.0.0.0',
  };
}

/**
 * Intenta usar el puerto fijo deseado; si está ocupado, cae a uno efímero.
 * El efímero se bindea al MISMO host configurado (0.0.0.0 por defecto): antes
 * se ataba a 127.0.0.1 y, si el puerto fijo estaba tomado, el celular no
 * alcanzaba la app (veía el server de desarrollo u otra cosa). Con host
 * compartido, la app sigue siendo alcanzable desde la red aunque cambie el
 * puerto.
 * @returns {Promise<{port:number, ephemeral:boolean}>}
 */
function resolvePort(wanted, host) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    const fallback = () => {
      const tmp = net.createServer();
      tmp.listen(0, host, () => {
        const p = tmp.address().port;
        tmp.close(() => resolve({ port: p, ephemeral: true }));
      });
      tmp.on('error', () => resolve({ port: null, ephemeral: true }));
    };
    probe.once('error', () => {
      probe.close(() => fallback());
    });
    probe.listen(wanted, host, () => {
      const ok = probe.address().port;
      probe.close(() => resolve({ port: ok, ephemeral: false }));
    });
  });
}

// Una sola instancia: si ya hay otra corriendo, esta se cierra y la otra se muestra.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.setAppUserModelId('com.overseer.gym');

let mainWindow = null;
let tray = null;
let isQuitting = false;

const iconPath = () => path.join(__dirname, 'assets', 'favicon.ico');

function showWindow() {
  if (!mainWindow) createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: iconPath(),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  // Cerrar la ventana oculta la app en la bandeja (como se venía usando).
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(port, ephemeral) {
  tray = new Tray(nativeImage.createFromPath(iconPath()));
  const tip = ephemeral
    ? `OVERSEER · puerto ${port} (temporal: el fijo estaba ocupado)`
    : `OVERSEER · puerto ${port}`;
  tray.setToolTip(tip);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir OVERSEER', click: showWindow },
    { type: 'separator' },
    { label: 'Salir', click: () => { isQuitting = true; app.quit(); } },
  ]));
  tray.on('double-click', showWindow);
}

/** Auto-updater: solo en la app empaquetada y con release publicado. */
function setupAutoUpdater() {
  if (!app.isPackaged) return;

  const { autoUpdater } = require('electron-updater');
  autoUpdater.autoDownload = true;
  autoUpdater.logger = { info: () => {}, warn: () => {}, error: () => {} };

  autoUpdater.on('error', (err) => console.error('[updater]', err));
  autoUpdater.on('update-available', () => {
    console.log('[updater] Hay una actualización disponible, descargando…');
  });
  autoUpdater.on('update-downloaded', () => {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      defaultId: 0,
      title: 'Actualización lista',
      message: 'Se descargó una nueva versión de OVERSEER.',
      detail: 'Reiniciá la app para aplicarla.',
    });
    if (choice === 0) autoUpdater.quitAndInstall();
  });

  // Chequea al arrancar; falla silencioso si no hay release todavía.
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
}

app.on('second-instance', showWindow);

app.on('before-quit', () => {
  isQuitting = true;
});

app.whenReady().then(async () => {
  const cfg = loadConfig();
  process.env.HOST = cfg.host;

  // Puerto fijo (origen estable para que persistan tema/sesión/flags); si está
  // ocupado, efímero y se muestra en la bandeja y el título de la ventana.
  const { port, ephemeral } = await resolvePort(cfg.port, cfg.host);
  if (ephemeral) {
    console.warn(`[overseer] el puerto fijo ${cfg.port} está ocupado → usando ${port} (temporal)`);
  }
  process.env.PORT = String(port);

  // Carga y arranca el server embebido (su top-level abre migrate + listen).
  // eslint-disable-next-line global-require
  const { server } = require(path.join(__dirname, 'dist', 'server-bundle.cjs'));

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  createWindow();
  createTray(port, ephemeral);
  setupAutoUpdater();

  const base = `http://127.0.0.1:${port}/`;
  mainWindow.loadURL(base);
  console.log(`[overseer] front en ${base}`);

  if (ephemeral) {
    mainWindow.once('did-finish-load', () =>
      mainWindow.setTitle(`OVERSEER · Gym Manager (puerto ${port}; el ${cfg.port} estaba ocupado)`));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // No salimos: la app vive en la bandeja hasta "Salir".
});
