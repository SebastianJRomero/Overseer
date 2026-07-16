/*
  lib/initials.js — Iniciales para avatares.

  "Valeria Gómez" → "VG". Se usa en la TopBar, filas de miembros, usuarios
  y vencimientos. Centralizado para que todos los avatares se calculen igual.
*/

/**
 * Toma la primera letra de las dos primeras palabras del nombre.
 * Si solo hay una palabra, usa sus dos primeras letras ("Admin" → "AD"),
 * igual que hace el prototipo con el usuario de la sesión.
 * @param {string} name
 * @returns {string} 1-2 letras en mayúscula
 */
export function getInitials(name) {
  const parts = String(name || '').trim().split(/[\s.@_-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
