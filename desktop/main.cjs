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

const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, ipcMain, shell } = require('electron');
const net = require('node:net');
const os = require('node:os');
const dgram = require('node:dgram');
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
  const cfgPath = path.join(app.getPath('userData'), 'config.json');  try {
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
      // Puente mínimo para el front (abrir carpeta de recibos). Sin esto,
      // `window.overseer` no existe y el botón ni se muestra (ver preload.cjs).
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Red de seguridad global: CUALQUIER link externo futuro (target=_blank o
  // window.open) va al navegador del sistema y nunca abre ventanas Electron.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch { /* URL inválida: se deniega igual */ }
    return { action: 'deny' };
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

// ── IPs LAN para mostrar la URL de conexión en la bandeja ──────────────────
// Misma lógica que server/src/lib/network.js, duplicada aquí porque main.cjs
// es CommonJS y no puede require() un módulo ESM del server. El truco del
// socket UDP a 8.8.8.8:80 deja que el S.O. elija la IP de la ruta por defecto
// (no se envía ningún paquete: basta conectar y leer el origen local).
const VIRTUAL_RE = /virtualbox|vmware|vethernet|wsl|docker|hyper-v|npcap|loopback/i;

function lanIps() {
  const found = [];
  const ifaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(ifaces || {})) {
    if (VIRTUAL_RE.test(name)) continue;
    for (const a of addrs || []) {
      const isV4 = a.family === 'IPv4' || a.family === 4;
      if (isV4 && !a.internal) found.push({ name, address: a.address });
    }
  }
  return found;
}

function primaryIp() {
  const all = lanIps();
  if (all.length === 0) return Promise.resolve(null);
  return new Promise((resolve) => {
    const sock = dgram.createSocket('udp4');
    let settled = false;
    const settle = (v) => { if (settled) return; settled = true; try { sock.close(); } catch {} resolve(v); };
    sock.on('error', () => settle(null));
    sock.once('connect', () => {
      const a = sock.address().address;
      settle(a && a !== '0.0.0.0' ? a : null);
    });
    sock.connect(80, '8.8.8.8');
    setTimeout(() => settle(null), 500); // nunca colgar el arranque
  }).then((addr) => addr || (all[0] ? all[0].address : null));
}

async function createTray(port, ephemeral) {
  tray = new Tray(nativeImage.createFromPath(iconPath()));
  // Tooltip con la URL para conectarse desde el celular/otro PC (IP de la
  // ruta por defecto). Sin IP LAN cae a 127.0.0.1 (solo funciona local).
  const ip = await primaryIp();
  const base = `http://${ip || '127.0.0.1'}:${port}`;
  tray.setToolTip(ephemeral
    ? `OVERSEER · ${base} (temporal: el fijo estaba ocupado)`
    : `OVERSEER · ${base}`);
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

// ── Puente recibos: carpeta propia + guardado ───────────────────────────
// Los PNG del recibo digital viven en la carpeta de LA APP
// (%APPDATA%\OVERSEER\recibos) salvo que Ajustes fije otra (receiptsDir).
// Solo existe en escritorio: en la web el front usa Descargas (lib/desktop.js).

/** Carpeta por defecto de recibos (se crea si no existe). */
function defaultReceiptsDir() {
  const dir = path.join(app.getPath('userData'), 'recibos');
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* sin permiso → igual se devuelve */ }
  return dir;
}

/** Carpeta efectiva: la elegida si es ruta absoluta válida, si no la default. */
function resolveReceiptsDir(prefer) {
  return resolveReceiptsDirInfo(prefer).dir;
}

/**
 * Variante informativa: indica si se cayó a la default y por qué, para que
 * el front avise en vez de parecer "no se guardó en la carpeta elegida".
 * @returns {{dir:string, fallback:boolean, reason:string}}
 */
function resolveReceiptsDirInfo(prefer) {
  const wanted = String(prefer || '').trim();
  // Sin carpeta elegida: la default es lo esperado, no un fallback.
  if (!wanted) return { dir: defaultReceiptsDir(), fallback: false, reason: '' };
  if (!path.isAbsolute(wanted)) {
    return { dir: defaultReceiptsDir(), fallback: true, reason: 'ruta no absoluta' };
  }
  try {
    fs.mkdirSync(wanted, { recursive: true });
    fs.accessSync(wanted, fs.constants.W_OK);
    return { dir: wanted, fallback: false, reason: '' };
  } catch (err) {
    return { dir: defaultReceiptsDir(), fallback: true, reason: err?.code || 'sin permiso' };
  }
}

ipcMain.handle('overseer:open-receipts-folder', async (_e, prefer) => {
  await shell.openPath(resolveReceiptsDir(prefer));
  return true;
});

// ── Puente links externos: navegador del sistema ────────────────────────
// Sin esto, un `target="_blank"` (p. ej. el botón WhatsApp del recibo) abre
// una ventana Electron extra en vez del navegador. Solo se permite `https:`
// para no exponer protocolos arbitrarios al renderer.
ipcMain.handle('overseer:open-external', async (_e, url) => {
  let parsed = null;
  try { parsed = new URL(String(url || '')); } catch { /* URL inválida */ }
  if (!parsed || parsed.protocol !== 'https:') throw new Error('URL externa no permitida');
  await shell.openExternal(parsed.toString());
  return true;
});

ipcMain.handle('overseer:default-receipts-dir', () => defaultReceiptsDir());

ipcMain.handle('overseer:pick-receipts-dir', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths[0]) return null;
  return r.filePaths[0];
});

ipcMain.handle('overseer:save-receipt', async (_e, { filename, dataUrl, dir } = {}) => {
  const info = resolveReceiptsDirInfo(dir);
  const safe = String(filename || 'recibo.png').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
  // Tolerante a saltos de línea: algunos FileReader/partes insertan \n en base64.
  const m = /^data:image\/png;base64,([\s\S]+)$/.exec(String(dataUrl || '').trim());
  if (!m) throw new Error('PNG inválido');
  const b64 = m[1].replace(/\s/g, '');
  const full = path.join(info.dir, safe);
  fs.writeFileSync(full, Buffer.from(b64, 'base64'));
  return { path: full, dir: info.dir, fallback: info.fallback, reason: info.reason };
});

app.on('second-instance', showWindow);

app.on('before-quit', () => {
  isQuitting = true;
});

app.whenReady().then(async () => {
  const cfg = loadConfig();
  process.env.HOST = cfg.host;
  // Versión visible en Ajustes/menú (la de este package.json, hoy 1.0.5).
  try {
    // eslint-disable-next-line global-require
    process.env.OVERSEER_VERSION = require('./package.json').version || '1.0.5';
  } catch { process.env.OVERSEER_VERSION = '1.0.5'; }

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
  await createTray(port, ephemeral);
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
