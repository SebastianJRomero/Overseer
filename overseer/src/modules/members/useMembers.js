/*
  modules/members/useMembers.js — Estado y lógica de datos del módulo.

  Único punto del módulo que habla con membersService (los componentes
  reciben todo por props/este hook — ARQUITECTURA §9). Expone:

    - members: lista con el ESTADO YA DERIVADO ({ ...member, status })
      para que ningún componente recalcule la regla por su cuenta.
    - counts: { activos, pronto, vencidos } para los chips de la toolbar.
      Ojo: "activos" = no vencidos (incluye a los que vencen pronto),
      igual que cuenta el prototipo.
    - createMember / updateMember / renewMember: acciones que persisten
      via service y refrescan la lista local.
*/

import { useEffect, useMemo, useState } from 'react';
import * as membersService from '../../services/membersService';
import { getMemberStatus, STATUS } from '../../lib/memberStatus';

export default function useMembers() {
  const [rawMembers, setRawMembers] = useState([]);

  useEffect(() => {
    membersService.listMembers().then(setRawMembers);
  }, []);

  /* El estado se deriva UNA vez por render de lista (memo) y viaja con el
     miembro; la fecha "hoy" se evalúa aquí para toda la lista por igual. */
  const members = useMemo(
    () => rawMembers.map((m) => ({ ...m, status: getMemberStatus(m) })),
    [rawMembers],
  );

  const counts = useMemo(() => ({
    activos: members.filter((m) => m.status !== STATUS.VENCIDO).length,
    pronto: members.filter((m) => m.status === STATUS.PRONTO).length,
    vencidos: members.filter((m) => m.status === STATUS.VENCIDO).length,
  }), [members]);

  const createMember = async (datos) => {
    // Devuelve el miembro creado (el recibo digital necesita su consecutivo).
    const saved = await membersService.createMember(datos);
    setRawMembers(await membersService.listMembers());
    return saved;
  };

  const updateMember = async (id, patch) => {
    setRawMembers(await membersService.updateMember(id, patch));
  };

  const renewMember = async (id, datos) => {
    // Devuelve la lista actualizada (el recibo digital busca ahí el número).
    const list = await membersService.renewMember(id, datos);
    setRawMembers(list);
    return list;
  };

  // Superusuario: deshace la última renovación duplicada (borra el asiento
  // extra y restaura el recibo previo). Devuelve lo que diga el backend.
  const undoLastRenew = async (id, reciboPrevio) => {
    const out = await membersService.undoLastRenew(id, reciboPrevio);
    if (out?.members) setRawMembers(out.members);
    else setRawMembers(await membersService.listMembers());
    return out;
  };

  return { members, counts, createMember, updateMember, renewMember, undoLastRenew };
}
