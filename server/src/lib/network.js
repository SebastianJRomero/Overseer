/*
  lib/network.js — IPs LAN de la máquina para conectarse desde otro equipo.

  Sin librerías externas (ARQUITECTURA §7): node:os enumera las interfaces y
  un socket UDP "conectado" a 8.8.8.8:80 deja que el sistema operativo elija
  la IP de la ruta por defecto (no se ENVÍA ningún paquete: basta conectar y
  leer el origen local). Lo usan la ruta /api/settings/network y la consola
  del server al arrancar.
*/

import os from 'node:os';
import dgram from 'node:dgram';

/* Nombres de adaptadores virtuales/nube que NO sirven para conectarse. */
const VIRTUAL_RE = /virtualbox|vmware|vethernet|wsl|docker|hyper-v|npcap|loopback/i;

/**
 * Direcciones IPv4 LAN activas (con el nombre de su adaptador).
 * Excluye loopback y adaptadores virtuales (VirtualBox, WSL, Docker…).
 * @returns {Array<{name: string, address: string}>}
 */
export function lanIps() {
  const found = [];
  const ifaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(ifaces || {})) {
    if (VIRTUAL_RE.test(name)) continue;
    for (const a of addrs || []) {
      // Desde node 18 family viene como 'IPv4'/'IPv6' (antes como número).
      const isV4 = a.family === 'IPv4' || a.family === 4;
      if (isV4 && !a.internal) found.push({ name, address: a.address });
    }
  }
  return found;
}

/**
 * IP que usaría el sistema para salir a la red (la de la ruta por defecto):
 * la más útil para el celu/otro PC. Es async porque el socket necesita
 * conectarse; cae a la primera IP LAN si la detección falla o tarda.
 * @returns {Promise<string|null>} null si no hay interfaces LAN
 */
export async function primaryIp() {
  const all = lanIps();
  if (all.length === 0) return null;
  try {
    const addr = await new Promise((resolve) => {
      const sock = dgram.createSocket('udp4');
      let settled = false;
      const settle = (v) => {
        if (settled) return;
        settled = true;
        try { sock.close(); } catch { /* ya cerrado */ }
        resolve(v);
      };
      sock.on('error', () => settle(null));
      sock.once('connect', () => {
        const a = sock.address().address;
        settle(a && a !== '0.0.0.0' ? a : null);
      });
      sock.connect(80, '8.8.8.8');
      // Red de seguridad: nunca colgar el arranque de la app.
      setTimeout(() => settle(null), 500);
    });
    return addr || all[0].address;
  } catch {
    return all[0].address;
  }
}