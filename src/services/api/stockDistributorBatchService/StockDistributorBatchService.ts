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
const stockDistributorBatchDexie = StockDistributorBatch.entity;

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
            offset = offset + 100;
            this.get(offset);
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
    return db[stockDistributorBatchDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockDistributorBatch.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getMobile() {
    try {
      const rows = await db[stockDistributorBatchDexie].toArray();
      stockDistributorBatch.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockDistributorBatch?offset=' + offset + '&max=100')
        .then((resp) => {
          stockDistributorBatch.addBulkMobile(resp.data);
          console.log('Data synced from backend: stockDistributorBatch');
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
    return db[stockDistributorBatchDexie]
      .bulkAdd(params)
      .then(() => {
        stockDistributorBatch.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    stockDistributorBatch.flush();
  },
};
