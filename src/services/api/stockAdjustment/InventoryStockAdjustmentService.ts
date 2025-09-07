import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import InventoryService from '../inventoryService/InventoryService';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const inventoryStockAdjustment = useRepo(InventoryStockAdjustment);
const inventoryStockAdjustmentDexie = db[InventoryStockAdjustment.entity];

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },

  get(offset: number) {
    if (!isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(id: string, params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: any) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },
  async apiFetchById(id: string) {
    if (!isOnline.value) {
      return this.apiFetchByIdMobile(id);
    } else {
      return this.apiFetchByIdWeb(id);
    }
  },

  async apiGetAll(offset: number, max: number) {
    if (!isOnline.value) {
      return this.apiGetAllMobile();
    } else {
      return this.apiGetAllWeb(offset, max);
    }
  },

  async apiSave(adjustment: any) {
    return await api().post('/inventoryStockAdjustment', adjustment);
  },

  async apiRemove(id: string) {
    return await api().delete(`/inventoryStockAdjustment/${id}`);
  },
  async apiUpdate(adjustment: any) {
    return await api().patch(
      '/inventoryStockAdjustment/' + adjustment.id,
      adjustment
    );
  },

  // Web

  async postWeb(params: string) {
    return api()
      .post('inventoryStockAdjustment', params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('/inventoryStockAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          inventoryStockAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  getAllByClinic(clinicId: any, offset: number) {
    if (!isOnline.value) {
      this.getAllByClinicMobile(clinicId);
    } else {
      this.getAllByClinicWeb(clinicId, offset);
    }
  },

  getAllByClinicWeb(clinicId: any, offset: number) {
    if (offset >= 0) {
      return api()
        .get(
          'inventoryStockAdjustment/clinic/' +
            clinicId +
            '?offset=' +
            offset +
            '&max=100'
        )
        .then((resp) => {
          inventoryStockAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('/inventoryStockAdjustment/' + id, params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('/inventoryStockAdjustment/' + id)
      .then(() => {
        inventoryStockAdjustment.destroy(id);
      });
  },
  async apiFetchByIdWeb(id: string) {
    return await api().get(`/inventoryStockAdjustment/${id}`);
  },
  async apiGetAllWeb(offset: number, max: number) {
    return await api().get(
      '/inventoryStockAdjustment?offset=' + offset + '&max=' + max
    );
  },

  //Mobile

  async putMobile(params: any) {
    return inventoryStockAdjustmentDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        inventoryStockAdjustment.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getMobile() {
    try {
      const rows = await inventoryStockAdjustmentDexie.toArray();
      inventoryStockAdjustment.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getAllFinalizedInventoryStockAdjustmentMobile() {
    const rows = await inventoryStockAdjustmentDexie.toArray();
    const data = rows.filter((row) => row.inventory && row.finalised === true);
    return data;
  },

  async deleteMobile(id: any) {
    try {
      await inventoryStockAdjustmentDexie.delete(id);
      inventoryStockAdjustment.destroy(id);
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async apiFetchByIdMobile(id: any) {
    return inventoryStockAdjustmentDexie
      .where('id')
      .equalsIgnoreCase(id)
      .then((rows: any) => {
        inventoryStockAdjustment.save(rows);
        return rows;
      });
  },

  async apiGetAdjustmentsByInventoryIdMobile(id: any) {
    const rows = await inventoryStockAdjustmentDexie.toArray();
    const data = rows.filter((row) => row.inventory && row.inventory.id === id);
    return data;
  },
  async apiGetAllMobile() {
    try {
      const rows = await inventoryStockAdjustmentDexie.toArray();

      const inventoryIds = rows.map((inventoryStockAdjustment: any) =>
        inventoryStockAdjustment.inventory_id !== null &&
        inventoryStockAdjustment.inventory_id !== undefined
          ? inventoryStockAdjustment.inventory_id
          : ''
      );
      const [inventories] = await Promise.all([
        InventoryService.getAllByIDsFromDexie(inventoryIds),
      ]);

      rows.map((inventoryStockAdjustment: any) => {
        inventoryStockAdjustment.inventory = inventories.find(
          (inventory: any) =>
            inventoryStockAdjustment.inventory_id === inventory.id
        );
      });

      inventoryStockAdjustment.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetAll() {
    try {
      const rows = await inventoryStockAdjustmentDexie.toArray();
      inventoryStockAdjustment.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getAllByClinicMobile(clinicId: any) {
    const collection = inventoryStockAdjustmentDexie.filter(
      (inventoryStockAdjustment: InventoryStockAdjustment) =>
        clinicId === inventoryStockAdjustment?.clinic?.id
    );
    return await collection.toArray().then((rows: any) => {
      inventoryStockAdjustment.save(rows);
      return rows;
    });
  },
  async getAllByStockIDsFromDexie(ids: string[]) {
    const collection = inventoryStockAdjustmentDexie.filter(
      (inventoryStockAdjustment: InventoryStockAdjustment) =>
        ids.includes(inventoryStockAdjustment?.patientServiceIdentifier?.id)
    );
    const inventoriesStocksAdjustiments = await collection.toArray();

    const inventoryIds = inventoriesStocksAdjustiments.map(
      (inventoryStockAdjustiment: any) =>
        inventoryStockAdjustiment?.inventory?.id
          ? inventoryStockAdjustiment.inventory.id
          : ''
    );
    const [inventories] = await Promise.all([
      InventoryService.getAllByIDsFromDexie(inventoryIds),
    ]);

    inventoriesStocksAdjustiments.map((inventoryStockAdjustiment: any) => {
      inventoryStockAdjustiment.inventory = inventories.find((inventory: any) =>
        inventory.id === inventoryStockAdjustiment?.inventory?.id
          ? inventoryStockAdjustiment.inventory.id
          : ''
      );
    });

    return inventoriesStocksAdjustiments;
  },
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('inventoryStockAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          inventoryStockAdjustment.addBulkMobile(resp.data);
          console.log('Data synced from backend: inventoryStockAdjustment');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  addBulkMobile(params: string) {
    return inventoryStockAdjustmentDexie
      .bulkAdd(params)
      .then(() => {
        inventoryStockAdjustment.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    inventoryStockAdjustment.flush();
  },
  deleteAllFromDexie() {
    inventoryStockAdjustmentDexie.clear();
  },
};
