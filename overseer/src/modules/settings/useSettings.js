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
  const [receipts, setReceipts] = useState({ enabled: false, prefix: 'RC', next: null });
  const [backup, setBackup] = useState({ auto: true, last: '' });
  const [backups, setBackups] = useState([]); // respaldos en disco: [{name,size,date}]

  const load = useCallback(async () => {
    const [g, u, p, n, r, b, files] = await Promise.all([
      settingsService.getGymInfo(),
      usersService.listUsers(),
      plansService.listPlans(),
      settingsService.getNotifications(),
      settingsService.getReceipts(),
      settingsService.getBackup(),
      settingsService.listBackups(),
    ]);
    setGym(g); setUsers(u); setPlans(p); setNotifications(n); setReceipts(r); setBackup(b); setBackups(files.files || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Refresca la lista de respaldos desde el disco (tras crear/borrar). */
  const refreshBackups = useCallback(async () => {
    const files = await settingsService.listBackups();
    setBackups(files.files || []);
  }, []);

  return {
    gym, users, plans, notifications, receipts, backup, backups,

    setGymField: async (k, v) => setGym(await settingsService.setGymField(k, v)),
    createUser: async (d) => setUsers(await usersService.createUser(d)),
    updateUser: async (id, patch) => setUsers(await usersService.updateUser(id, patch)),
    deleteUser: async (id) => setUsers(await usersService.deleteUser(id)),
    createPlan: async (d) => setPlans(await plansService.createPlan(d)),
    togglePlan: async (id) => setPlans(await plansService.togglePlan(id)),
    deletePlan: async (id) => setPlans(await plansService.deletePlan(id)),
    setNotification: async (k, on) => setNotifications(await settingsService.setNotification(k, on)),
    setReceipt: async (k, v) => setReceipts(await settingsService.setReceipt(k, v)),
    setAutoBackup: async (on) => setBackup(await settingsService.setAutoBackup(on)),
    runBackup: async () => {
      setBackup(await settingsService.runBackup());
      await refreshBackups();
    },
    deleteBackup: async (name) => {
      await settingsService.deleteBackup(name);
      await refreshBackups();
    },
  };
}
