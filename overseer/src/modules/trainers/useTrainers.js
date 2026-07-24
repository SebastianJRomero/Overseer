/*
  modules/trainers/useTrainers.js — Estado y datos del módulo Entrenadores.

  Único punto que habla con trainersService. Expone la lista y el alta.
*/

import { useEffect, useState } from 'react';
import * as trainersService from '../../services/trainersService';

export default function useTrainers() {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => { trainersService.listTrainers().then(setTrainers); }, []);

  return {
    trainers,
    createTrainer: async (datos) => setTrainers(await trainersService.createTrainer(datos)),
    updateTrainer: async (id, patch) => setTrainers(await trainersService.updateTrainer(id, patch)),
    deleteTrainer: async (id) => setTrainers(await trainersService.deleteTrainer(id)),
  };
}
