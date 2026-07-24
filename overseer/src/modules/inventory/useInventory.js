/*
  modules/inventory/useInventory.js — Estado y lógica de datos del inventario.

  Único punto del módulo que habla con inventoryService. Carga los tres
  sub-inventarios (productos, equipos, cilindros de gas) y expone las
  acciones de CRUD; cada acción persiste vía service y refresca la parte
  correspondiente. Los componentes reciben todo por props/este hook
  (ARQUITECTURA §9) — nunca llaman al service por su cuenta.
*/

import { useCallback, useEffect, useState } from 'react';
import * as inventoryService from '../../services/inventoryService';

export default function useInventory() {
  const [products, setProducts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [cylinders, setCylinders] = useState([]);

  const refreshProducts = useCallback(async () => setProducts(await inventoryService.listProducts()), []);
  const refreshEquipment = useCallback(async () => setEquipment(await inventoryService.listEquipment()), []);
  const refreshGas = useCallback(async () => setCylinders(await inventoryService.listCylinders()), []);

  useEffect(() => { refreshProducts(); refreshEquipment(); refreshGas(); }, [refreshProducts, refreshEquipment, refreshGas]);

  return {
    products, equipment, cylinders,

    // Productos
    createProduct: async (d) => setProducts(await inventoryService.createProduct(d)),
    updateProduct: async (id, p) => setProducts(await inventoryService.updateProduct(id, p)),
    deleteProduct: async (id) => setProducts(await inventoryService.deleteProduct(id)),

    // Equipos
    createEquipment: async (d) => setEquipment(await inventoryService.createEquipment(d)),
    updateEquipment: async (id, p) => setEquipment(await inventoryService.updateEquipment(id, p)),

    // Gas
    createPurchase: async (d) => setCylinders(await inventoryService.createPurchase(d)),
    addUsage: async (cylId, u) => setCylinders(await inventoryService.addUsage(cylId, u)),
    updateUsage: async (cylId, uId, p) => setCylinders(await inventoryService.updateUsage(cylId, uId, p)),
    deleteUsage: async (cylId, uId) => setCylinders(await inventoryService.deleteUsage(cylId, uId)),
    finalizeCylinder: async (cylId, d) => setCylinders(await inventoryService.finalizeCylinder(cylId, d)),
  };
}
