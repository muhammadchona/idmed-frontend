import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import api from '../apiService/apiService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const { alertSucess, alertError } = useSwal();
const stockEntrance = useRepo(StockEntrance);
const stockEntranceDexie = db[StockEntrance.entity];

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

  async getFromBackEnd(offset: number, clinicId: string) {
    if (offset >= 0) {
      return await api()
        .get(
          '/stockEntrance/clinic/' +
            clinicId +
            '?offset=' +
            offset +
            '&max=' +
            100
        )
        .then(async (resp) => {
          stockEntrance.save(resp.data);
          await stockEntranceDexie.bulkPut(resp.data);
          console.log('Data synced from backend: stockEntrance');
          offset = offset + 100;
          if (resp.data.length > 0) {
            return this.getFromBackEnd(offset, clinicId);
          }
          return true;
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          throw error;
        });
    }
  },

  async getStockEntrancesByIds(entranceIds: any) {
    return stockEntranceDexie.where('id').anyOf(entranceIds).toArray();
  },

  addBulkMobile(params: string) {
    const stocksEntranceFromPinia = this.getAllFromStorage();
    return stockEntranceDexie
      .bulkPut(stocksEntranceFromPinia)
      .then(() => {
        //  stockEntrance.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  // WEB
  postWeb(params: string) {
    return api()
      .post('stockEntrance', params)
      .then((resp) => {
        stockEntrance.save(resp.data);
        return resp.data;
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockEntrance?offset=' + offset + '&max=100')
        .then((resp) => {
          stockEntrance.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stockEntrance/' + id, params)
      .then((resp) => {
        stockEntrance.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stockEntrance/' + id)
      .then(() => {
        stockEntrance.destroy(id);
      });
  },
  apiFetchByIdWeb(id: string) {
    return api()
      .get('/stockEntrance/' + id)
      .then((resp) => {
        stockEntrance.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number, max: number) {
    if (offset >= 0) {
      return api()
        .get(
          '/stockEntrance/clinic/' +
            clinicId +
            '?offset=' +
            offset +
            '&max=' +
            max
        )
        .then((resp) => {
          if (resp.data.length > 0) {
            stockEntrance.save(resp.data);
            offset = offset + 100;
            this.apiGetAllByClinicIdWeb(clinicId, offset, max);
          } else {
            closeLoading();
          }
        });
    }
  },

  //Mobile

  addMobile(params: string) {
    return stockEntranceDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockEntrance.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async putMobile(params: any) {
    return stockEntranceDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockEntrance.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getMobile() {
    try {
      const rows = await stockEntranceDexie.toArray();
      stockEntrance.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  getByStockEntranceMobile(stockEntrance: any) {
    return stockEntranceDexie
      .where('id')
      .equalsIgnoreCase(stockEntrance.id)
      .toArray()
      .then((rows: any) => {
        stockEntrance.save(rows);
        return rows;
      });
  },

  async getAllByIDsFromDexie(ids: []) {
    return await stockEntranceDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },

  async getCountStockEntranceFromDexie() {
    return await stockEntranceDexie.count();
  },

  async deleteMobile(paramsId: any) {
    try {
      await stockEntranceDexie.delete(paramsId);
      stockEntrance.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  apiFetchByIdMobile(id: any) {
    return stockEntranceDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first()
      .then((rows: any) => {
        stockEntrance.save(rows);
        return rows;
      });
  },

  async apiGetAllByClinicIdMobile(id: any) {
    const collection = stockEntranceDexie.filter(
      (stockEntrance: StockEntrance) => id === stockEntrance?.clinic?.id
    );
    return await collection.toArray().then((rows: any) => {
      stockEntrance.save(rows);
      return rows;
    });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockEntrance.getModel().$newInstance();
  },
  // ****** PNIA
  getStockEntranceById(id: string) {
    return stockEntrance
      .query()
      .with('stocks')
      .with('clinic')
      .where('id', id)
      .first();
  },
  getStockEntranceByNumber(number: string) {
    return stockEntrance.query().where('orderNumber', number).first();
  },
  getStockEntrances() {
    return stockEntrance
      .query()
      .with('clinic')
      .with('stocks')
      .orderBy('dateReceived', 'desc')
      .get();
  },

  getAllFromStorage() {
    return stockEntrance.all();
  },

  deleteAllFromStorage() {
    stockEntrance.flush();
  },
};
