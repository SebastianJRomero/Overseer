/*
  hooks/useActivePlans — Planes activos del catálogo (Ajustes → Planes).

  Fuente única de los planes que se pueden ofrecer al crear o renovar una
  membresía: lee `plansService.listActivePlans()` (solo activos) al montar.
  Lo usan los sitios que abren el wizard/ficha de Miembros (el módulo Miembros
  y el Inicio), para que activar/ocultar/crear un plan en Ajustes se refleje en
  el alta y la renovación sin duplicar el catálogo.

  @returns {Array} planes activos [{ id, nombre, duracionDias, precio, activo }]
*/

import { useEffect, useState } from 'react';
import * as plansService from '../services/plansService';

export default function useActivePlans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    plansService.listActivePlans().then(setPlans);
  }, []);

  return plans;
}
