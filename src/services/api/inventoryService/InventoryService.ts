import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import moment from 'moment';
import db from 'src/stores/dexie';

const { closeLoading, showloading } = useLoading();
const inventoryDexie = Inventory.entity;

const inventory = useRepo(Inventory);
const { isMobile, isOnline } = useSystemUtils();

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },

  async get(offset: number) {
    if (!isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset);
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

  async getAllByClinic(clinicId: any, offset: number) {
    if (!isOnline.value) {
      this.apiGetAllByClinicIdMobile(clinicId);
    } else {
      this.apiGetAllByClinicIdWeb(clinicId, offset);
    }
  },

  async apiClose(id: string, endDate: string) {
    return await api().patch(`/inventory/close/${id}/${endDate}`);
  },

  async apiRemove(id: string) {
    return await api().delete(`/inventory/${id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/inventory/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get('/inventory?offset=' + offset + '&max=' + max);
  },

  async isInventoryPeriod(clinicId: any) {
    if (isOnline.value) {
      return api()
        .get('inventory/isInventoryPeriod/' + clinicId)
        .then((resp) => {
          return resp.data;
        });
    } else {
      return false;
    }
  },

  getInventoryInPreviousMonth(startDate: any, endDate: any) {
    return inventory
      .query()
      .where('endDate', (value: Date) => {
        const startDateMoment = moment(value, 'YYYY-MM-DD');
        return (
          startDateMoment.isSameOrAfter(startDate) &&
          startDateMoment.isSameOrBefore(endDate)
        );
      })
      .first();
  },

  isInventoryStartDateBetweenDates(startDate: any, endDate: any) {
    const list = inventory
      .query()
      .where('startDate', (value: Date) => {
        const startDateMoment = moment(value, 'YYYY-MM-DD');
        return (
          startDateMoment.isSameOrAfter(startDate) &&
          startDateMoment.isSameOrBefore(endDate)
        );
      })
      .get();
    return list.length > 0;
  },

  hasInventoryBeforeDate(dateLimit: any) {
    const items = inventory
      .query()
      .where('endDate', (value: Date) => {
        const startDateMoment = moment(value, 'YYYY-MM-DD');
        return startDateMoment.isSameOrBefore(dateLimit);
      })
      .get();
    return items.length > 0;
  },

  isDateBetween21And25(dateMoment: any) {
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      21
    );

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      25
    );
    const date = moment(dateMoment, 'YYYY-MM-DD');
    return (
      date.isSameOrAfter(moment(startDate)) &&
      date.isSameOrBefore(moment(endDate))
    );
  },

  // Pinia
  newInstanceEntity() {
    return inventory.getModel().$newInstance();
  },

  getInventories() {
    return inventory
      .withAllRecursive(2)
      .orderBy('open', 'desc')
      .orderBy('startDate', 'desc')
      .get();
  },

  closeInventoryPinia(inventoryOb: any, endDate: any) {
    inventoryOb.open = false;
    inventoryOb.endDate = endDate;
    inventory.save(inventoryOb);
  },

  getOpenInventory() {
    return inventory.query().where('open', true).first();
  },
  getLastInventory() {
    return inventory.query().orderBy('endDate', 'desc').first();
  },
  getInvnetoryById(id: string) {
    return inventory.query().withAllRecursive(4).where('id', id).first();
  },
  getInvnetoryWithValidStockById(id: string) {
    return inventory.query().withAllRecursive(4).where('id', id).first();
  },

  getGeneralInventoryByDate(inventoryDate: Date) {
    return inventory
      .query()
      .where('startDate', (value: Date) => {
        return moment(value, 'YYYY-MM-DD').diff(moment(inventoryDate)) === 0;
      })
      .where('generic', true)
      .first();
  },

  // WEB
  postWeb(params: string) {
    return api()
      .post('inventory', params)
      .then((resp) => {
        inventory.save(resp.data);
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('inventory?offset=' + offset + '&max=100')
        .then((resp) => {
          inventory.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number) {
    if (offset >= 0) {
      return api()
        .get('inventory/clinic/' + clinicId + '?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            inventory.save(resp.data);
            offset = offset + 100;
            this.apiGetAllByClinicIdWeb(clinicId, offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('inventory/' + id, params)
      .then((resp) => {
        inventory.save(resp.data);
      });
  },

  async deleteWeb(id: any) {
    return api()
      .delete('inventory/' + id)
      .then(() => {
        inventory.destroy(id);
      });
  },
  async apiFetchByIdWeb(id: string) {
    return api()
      .get('/inventory/' + id)
      .then((resp) => {
        inventory.save(resp.data);
        return resp.data;
      });
  },
  // Local Storage Pinia
  deleteAllFromStorage() {
    inventory.flush();
  },

  //Mobile
  addMobile(params: string) {
    return db[inventoryDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        inventory.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getMobile() {
    try {
      const rows = await db[inventoryDexie].toArray();
      inventory.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async putMobile(params: any) {
    return db[inventoryDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        inventory.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async deleteMobile(id: any) {
    try {
      await db[inventoryDexie].delete(id);
      inventory.destroy(id);
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  apiFetchByIdMobile(id: any) {
    return db[inventoryDexie]
      .where('id')
      .equalsIgnoreCase(id)
      .toArray()
      .then((rows: any) => {
        inventory.save(rows);
        return rows;
      });
  },

  apiGetAllByClinicIdMobile(id: any) {
    return db[inventoryDexie]
      .where('clinic_id')
      .equalsIgnoreCase(id)
      .toArray()
      .then((rows: any) => {
        inventory.save(rows);
        return rows;
      });
  },
};
