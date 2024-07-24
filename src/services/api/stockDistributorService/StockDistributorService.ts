import { useRepo } from 'pinia-orm';
import StockDistributor from 'src/stores/models/stockDistributor/StockDistributor';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from 'src/stores/dexie';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const stockDistributor = useRepo(StockDistributor);
const stockDistributorDexie = StockDistributor.entity;

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
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async apiUpdate(id: string, params: string) {
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

  apiFetchById(id: string) {
    if (!isOnline.value) {
      return this.apiFetchByIdMobile(id);
    } else {
      return this.apiFetchByIdWeb(id);
    }
  },
  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    if (!isOnline.value) {
      this.apiGetAllByClinicIdMobile(clinicId);
    } else {
      this.apiGetAllByClinicIdWeb(clinicId, offset, max);
    }
  },

  // WEB
  postWeb(params: string) {
    return api()
      .post('stockDistributor', params)
      .then((resp) => {
        stockDistributor.save(resp.data);
        return resp.data;
      });
  },

  async getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDistributor?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            stockDistributor.save(resp.data);
            offset = offset + 100;
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stockDistributor/' + id, params)
      .then((resp) => {
        stockDistributor.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stockDistributor/' + id)
      .then(() => {
        stockDistributor.destroy(id);
      });
  },
  apiFetchByIdWeb(id: string) {
    return api()
      .get('/stockDistributor/' + id)
      .then((resp) => {
        stockDistributor.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/stockDistributor/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  //Mobile

  //Mobile
  async addMobile(params: any) {
    return db[stockDistributorDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockDistributor.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockEntrance?offset=' + offset + '&max=100')
        .then((resp) => {
          stockDistributor.addBulkMobile(resp.data);
          console.log('Data synced from backend: stockEntrance');
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
  //mobile
  addBulkMobile(params: string) {
    return db[stockDistributorDexie]
      .bulkAdd(params)
      .then(() => {
        stockDistributor.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async getMobile() {
    try {
      const rows = await db[stockDistributorDexie].toArray();
      stockDistributor.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async deleteMobile(id: any) {
    try {
      await db[stockDistributorDexie].delete(id);
      stockDistributor.destroy(id);
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async putMobile(params: any) {
    return db[stockDistributorDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockDistributor.save(JSON.parse(JSON.stringify(params)));
      });
  },

  apiFetchByIdMobile(id: any) {
    return db[stockDistributorDexie]
      .where('id')
      .equalsIgnoreCase(id)
      .then((rows: any) => {
        stockDistributor.save(rows);
        return rows;
      });
  },

  apiGetAllByClinicIdMobile(clinicId: any) {
    return db[stockDistributorDexie]
      .where('clinic_id')
      .equalsIgnoreCase(clinicId)
      .then((rows: any) => {
        stockDistributor.save(rows);
        return rows;
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockDistributor.getModel().$newInstance();
  },
  // ****** PNIA
  getStockDistributorById(id: string) {
    return stockDistributor
      .query()
      .with('drugDistributors')
      .with('clinic')
      .where('id', id)
      .first();
  },

  getStockDistributorServices(clinicId: any) {
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .where('clinic_id', clinicId)
      .orderBy('creationDate', 'desc')
      .get();
  },

  getStockDistributorConfirmation(clinicId: any) {
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .whereHas('drugDistributors', (query) => {
        query.where('clinic_id', clinicId);
      })
      .orderBy('creationDate', 'desc')
      .get();
  },
  deleteAllFromStorage() {
    stockDistributor.flush();
  },
};
