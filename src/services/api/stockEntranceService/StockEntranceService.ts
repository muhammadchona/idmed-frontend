import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import api from '../apiService/apiService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import StockService from '../stockService/StockService';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const { alertSucess, alertError } = useSwal();
const stockEntrance = useRepo(StockEntrance);
const stockEntranceDexie = db[StockEntrance.entity];

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const toPlainObject = (payload: any) => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.log(error);
      return payload;
    }
  }
  return payload;
};

let stockEntranceMobileCache: any[] = [];

const setStockEntranceMobileCache = (rows: any[]) => {
  stockEntranceMobileCache = rows.map((row) => clone(row));
};

const getStockEntranceMobileCache = () =>
  stockEntranceMobileCache.map((row) => clone(row));

const upsertStockEntranceCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockEntranceMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      stockEntranceMobileCache.splice(index, 1, payload);
    } else {
      stockEntranceMobileCache.push(payload);
    }
  });
};

const removeStockEntranceFromCache = (id: string) => {
  stockEntranceMobileCache = stockEntranceMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshStockEntranceMobileCache = async () => {
  const rows = await stockEntranceDexie.toArray();
  setStockEntranceMobileCache(rows);
  return getStockEntranceMobileCache();
};

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
        .then((resp) => {
          if (!isMobile.value) {
            stockEntrance.save(resp.data);
          }
          this.addBulkMobile(resp.data);
          console.log('Data synced from backend: stockEntrance');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset, clinicId);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getStockEntrancesByIds(entranceIds: any) {
    const rows = await stockEntranceDexie
      .where('id')
      .anyOf(entranceIds)
      .toArray();
    if (isMobile.value && !isOnline.value) {
      upsertStockEntranceCache(rows);
      return rows.map((entry: any) => clone(entry));
    }
    return rows;
  },

  addBulkMobile(payload?: any[]) {
    const stocksEntranceFromPinia = payload
      ? payload.map((entry) => clone(entry))
      : this.getAllFromStorage();
    return stockEntranceDexie
      .bulkPut(stocksEntranceFromPinia)
      .then(() => {
        upsertStockEntranceCache(stocksEntranceFromPinia);
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
    const payload = clone(toPlainObject(params));
    return stockEntranceDexie.put(payload).then(() => {
      upsertStockEntranceCache(payload);
      return payload;
    });
  },

  async putMobile(params: any) {
    const payload = clone(toPlainObject(params));
    return stockEntranceDexie.put(payload).then(() => {
      upsertStockEntranceCache(payload);
      return payload;
    });
  },

  async getMobile() {
    try {
      const rows = await stockEntranceDexie.toArray();
      setStockEntranceMobileCache(rows);
      return getStockEntranceMobileCache();
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
        upsertStockEntranceCache(rows);
        return rows.map((entry: any) => clone(entry));
      });
  },

  async getAllByIDsFromDexie(ids: []) {
    const rows = await stockEntranceDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
    upsertStockEntranceCache(rows);
    return rows.map((entry: any) => clone(entry));
  },

  async getCountStockEntranceFromDexie() {
    return await stockEntranceDexie.count();
  },

  async deleteMobile(paramsId: any) {
    try {
      await stockEntranceDexie.delete(paramsId);
      removeStockEntranceFromCache(paramsId);
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
        upsertStockEntranceCache(rows);
        return clone(rows);
      });
  },

  async apiGetAllByClinicIdMobile(id: any) {
    const collection = stockEntranceDexie.filter(
      (stockEntrance: StockEntrance) => id === stockEntrance?.clinic?.id
    );
    return await collection.toArray().then((rows: any) => {
      upsertStockEntranceCache(rows);
      return rows.map((entry: any) => clone(entry));
    });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockEntrance.getModel().$newInstance();
  },
  // ****** PNIA
  getStockEntranceById(id: string) {
    if (isMobile.value && !isOnline.value) {
      const entrances = getStockEntranceMobileCache();
      const entrance = entrances.find((e) => e.id === id);

      if (!entrance) return null;

      entrance.stocks = StockService.getStockMobileCache().filter(
        (s) => s.entrance_id === id || s.entranceId === id
      );

      return entrance;
    }
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
    if (isMobile.value && !isOnline.value) {
      return getStockEntranceMobileCache().sort((a, b) =>
        String(b.dateReceived || '').localeCompare(String(a.dateReceived || ''))
      );
    }
    return stockEntrance
      .query()
      .with('clinic')
      .with('stocks')
      .orderBy('dateReceived', 'desc')
      .get();
  },

  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getStockEntranceMobileCache();
    }
    return stockEntrance.all();
  },

  deleteAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      stockEntranceMobileCache = [];
      return stockEntranceDexie.clear();
    }
    stockEntrance.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockEntranceMobileCache();
  },
};
