/*
  modules/settings/roleStyles.js — Color de cada rol de usuario.

  Vive aparte (no dentro de AccountsSection) para que tanto la sección como el
  modal de nuevo usuario lo importen sin crear un ciclo de imports: si el modal
  lo tomara de AccountsSection —que a su vez importa el modal— el valor no
  estaría inicializado al evaluar el módulo (TDZ) y rompería el arranque.
*/

export const ROLE_STYLES = {
  Admin: { color: 'var(--acc-1)', bg: 'var(--acc-soft)' },
  Recepción: { color: 'var(--info)', bg: 'var(--info-bg)' },
  Entrenador: { color: 'var(--ok)', bg: 'var(--ok-bg)' },
};
