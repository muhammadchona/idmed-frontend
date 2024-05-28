import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import { useLoading } from 'src/composables/shared/loading/loading';
import moment from 'moment';

const { closeLoading, showloading } = useLoading();

const inventory = useRepo(Inventory);
const { isMobile, isOnline } = useSystemUtils();

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
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

  async apiClose(id: string) {
    return await api().patch(`/inventory/close/${id}`);
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
    if (isOnline) {
      return api()
        .get('inventory/isInventoryPeriod/' + clinicId)
        .then((resp) => {
          return resp.data;
        });
    } else {
      return false;
    }
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

  closeInventoryPinia(inventoryOb: any) {
    inventoryOb.open = false;
    inventoryOb.endDate = new Date();
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

  //Mobile
  async putMobile(params: any) {
    const resp = await nSQL('inventorys')
      .query('upsert', JSON.parse(JSON.stringify(params)))
      .exec();
    inventory.save(params);
    return resp;
  },

  getMobile() {
    return nSQL('inventorys')
      .query('select')
      .exec()
      .then((result) => {
        console.log(result);
        inventory.save(result);
        //  return result
      });
  },

  async deleteMobile(id: any) {
    const resp = await nSQL('inventorys')
      .query('delete')
      .where(['id', '=', id])
      .exec();
    inventory.destroy(id);
    return resp;
  },

  apiFetchByIdMobile(id: any) {
    return nSQL('inventorys')
      .query('select')
      .where(['id', '=', id])
      .exec()
      .then((result) => {
        console.log(result);
        inventory.save(result);
      });
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
};
