/*
  preload.cjs — Puente seguro entre el front y el proceso principal.

  Expone SOLO `window.overseer.openReceiptsFolder()` vía contextBridge: el
  front sigue sin nodeIntegration y en la web ese objeto ni existe (ver
  overseer/src/lib/desktop.js, que lo trata como no-op). Se empaqueta con
  "files" del package.json, igual que main.cjs.
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overseer', {
  // Abre la carpeta de recibos (la de la app o la elegida en Ajustes).
  openReceiptsFolder: (dir) => ipcRenderer.invoke('overseer:open-receipts-folder', dir || ''),
  // Carpeta por defecto de la app (%APPDATA%\OVERSEER\recibos).
  defaultReceiptsDir: () => ipcRenderer.invoke('overseer:default-receipts-dir'),
  // Selector de carpeta del sistema (diálogo nativo). Null si cancela.
  pickReceiptsDir: () => ipcRenderer.invoke('overseer:pick-receipts-dir'),
  // Guarda el PNG del recibo en la carpeta ({ filename, dataUrl, dir }).
  saveReceipt: (payload) => ipcRenderer.invoke('overseer:save-receipt', payload),
});
