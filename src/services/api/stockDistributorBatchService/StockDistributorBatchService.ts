import { useRepo } from 'pinia-orm';
import StockDistributorBatch from 'src/stores/models/stockDistributorBatch/StockDistributorBatch';
import api from '../apiService/apiService';
import moment from 'moment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const stockDistributorBatch = useRepo(StockDistributorBatch);
const stockDistributorBatchDexie = db[StockDistributorBatch.entity];

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

let stockDistributorBatchMobileCache: any[] = [];

const setStockDistributorBatchMobileCache = (rows: any[]) => {
  stockDistributorBatchMobileCache = rows.map((row) => clone(row));
};

const getStockDistributorBatchMobileCache = () =>
  stockDistributorBatchMobileCache.map((row) => clone(row));

const upsertStockDistributorBatchCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockDistributorBatchMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      stockDistributorBatchMobileCache.splice(index, 1, payload);
    } else {
      stockDistributorBatchMobileCache.push(payload);
    }
  });
};

const removeStockDistributorBatchFromCache = (id: string) => {
  stockDistributorBatchMobileCache = stockDistributorBatchMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshStockDistributorBatchMobileCache = async () => {
  const rows = await stockDistributorBatchDexie.toArray();
  setStockDistributorBatchMobileCache(rows);
  return getStockDistributorBatchMobileCache();
};

export default {
  // Axios API call
  post(params: any) {
    if (!isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    return this.getWeb(offset);
  },
  patch(id: string, params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: string) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockDistributorBatch.getModel().$newInstance();
  },
  async apiSave(stockDistributorBatch: any) {
    return api().post('/stockDistributorBatch', stockDistributorBatch);
  },

  async apiRemove(id: any) {
    return api().delete(`/stockDistributorBatch/${id}`);
  },

  async apiUpdate(stockDistributorBatch: any) {
    return api().patch(
      '/stockDistributorBatch/' + stockDistributorBatch.id,
      stockDistributorBatch
    );
  },

  async apiGetAll(offset: number, max: number) {
    return api().get('/stockDistributorBatch?offset=' + offset + '&max=' + max);
  },

  // PINIA

  getStockDistributorBatchList(id: string) {
    return stockDistributorBatch.query().withAllRecursive(3).get();

    //   .where('id', id)
  },

  getStockDistributorById(id: string) {
    return (
      stockDistributorBatch
        .query()
        //Stock.query()
        .with('drug')
        .with('clinic')
        .with('stockDistributor')
        .where('id', id)
        .first()
    );
  },
  // Web
  postWeb(params: string) {
    return api()
      .post('stockDistributorBatch', params)
      .then((resp) => {
        stockDistributorBatch.save(resp.data);
        return resp.data;
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDistributorBatch?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            stockDistributorBatch.save(resp.data);
            // this.addBulkMobile(resp.data);
            offset = offset + 100;
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  getStockDistributorBatch(stockDistributorId: string) {
    return stockDistributorBatch
      .query()
      .withAllRecursive(3)
      .where('stock_distributor_id', stockDistributorId)
      .first();
  },

  getStockDistributorBatchByDrugDistributorId(drugDistributorId: string) {
    return stockDistributorBatch
      .query()
      .withAllRecursive(3)
      .where('drug_distributor_id', drugDistributorId)
      .get();
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stockDistributorBatch/' + id, params)
      .then((resp) => {
        stockDistributorBatch.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stockDistributorBatch/' + id)
      .then(() => {
        stockDistributorBatch.destroy(id);
      });
  },

  //Mobile
  async addMobile(params: any) {
    const payload = clone(toPlainObject(params));
    return stockDistributorBatchDexie.put(payload).then(async () => {
      upsertStockDistributorBatchCache(payload);
      await getStockDistributorBatchMobileCache();
      return payload;
    });
  },

  async getMobile() {
    try {
      const rows = await stockDistributorBatchDexie.toArray();
      setStockDistributorBatchMobileCache(rows);
      return getStockDistributorBatchMobileCache();
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getFromBackEnd(offset: number) {
    if (offset < 0) {
      return;
    }
    try {
      const resp = await api().get(
        'stockDistributorBatch?offset=' + offset + '&max=100'
      );
      const data = Array.isArray(resp.data) ? resp.data : [];
      if (data.length > 0) {
        await this.addBulkMobile(data);
        console.log('Data synced from backend: stockDistributorBatch');
        return this.getFromBackEnd(offset + 100);
      }
    } catch (error) {
      console.error('Error syncing data from backend:', error);
      console.log(error);
    }
  },
  //mobile
  addBulkMobile(params: any) {
    const payload = Array.isArray(params)
      ? params.map((entry: any) => clone(entry))
      : [clone(params)];
    return stockDistributorBatchDexie
      .bulkPut(payload)
      .then(() => {
        upsertStockDistributorBatchCache(payload);
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      stockDistributorBatchMobileCache = [];
      return stockDistributorBatchDexie.clear().catch((error: any) => {
        console.log(error);
        throw error;
      });
    }
    stockDistributorBatch.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockDistributorBatchMobileCache();
  },
};
