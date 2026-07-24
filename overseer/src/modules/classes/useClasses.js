/*
  modules/classes/useClasses.js — Estado y datos del módulo Clases.

  Único punto que habla con classesService. Expone la lista y el alta.
*/

import { useEffect, useState } from 'react';
import * as classesService from '../../services/classesService';

export default function useClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => { classesService.listClasses().then(setClasses); }, []);

  return {
    classes,
    createClass: async (datos) => setClasses(await classesService.createClass(datos)),
    updateClass: async (id, patch) => setClasses(await classesService.updateClass(id, patch)),
    deleteClass: async (id) => setClasses(await classesService.deleteClass(id)),
  };
}
