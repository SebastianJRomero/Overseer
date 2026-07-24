/*
  modules/settings/useSettings.js — Estado y datos de Ajustes.

  Centraliza lo que vive en services (datos del gimnasio, cuentas, planes,
  notificaciones, respaldos) y expone las acciones; cada sección recibe lo
  que necesita por props desde SettingsModule. La APARIENCIA y los MÓDULOS
  no pasan por aquí: usan sus contextos globales (useTheme / useModules).
*/

import { useCallback, useEffect, useState } from 'react';
import * as settingsService from '../../services/settingsService';
import * as usersService from '../../services/usersService';
import * as plansService from '../../services/plansService';

export default function useSettings() {
  const [gym, setGym] = useState({});
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [backup, setBackup] = useState({ auto: true, last: '' });

  const load = useCallback(async () => {
    const [g, u, p, n, b] = await Promise.all([
      settingsService.getGymInfo(),
      usersService.listUsers(),
      plansService.listPlans(),
      settingsService.getNotifications(),
      settingsService.getBackup(),
    ]);
    setGym(g); setUsers(u); setPlans(p); setNotifications(n); setBackup(b);
  }, []);

  useEffect(() => { load(); }, [load]);

  return {
    gym, users, plans, notifications, backup,

    setGymField: async (k, v) => setGym(await settingsService.setGymField(k, v)),
    createUser: async (d) => setUsers(await usersService.createUser(d)),
    createPlan: async (d) => setPlans(await plansService.createPlan(d)),
    togglePlan: async (id) => setPlans(await plansService.togglePlan(id)),
    deletePlan: async (id) => setPlans(await plansService.deletePlan(id)),
    setNotification: async (k, on) => setNotifications(await settingsService.setNotification(k, on)),
    setAutoBackup: async (on) => setBackup(await settingsService.setAutoBackup(on)),
    runBackup: async () => setBackup(await settingsService.runBackup()),
  };
}
