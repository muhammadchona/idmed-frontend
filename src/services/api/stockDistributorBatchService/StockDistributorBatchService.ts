import { useRepo } from 'pinia-orm';
import StockDistributorBatch from 'src/stores/models/stockDistributorBatch/StockDistributorBatch';
import api from '../apiService/apiService';
import moment from 'moment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const stockDistributorBatch = useRepo(StockDistributorBatch);

export default {
  // Axios API call
  post(params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (!isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset);
    }
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

  getStockDistributorBatchByStockDistributorId(stockDistributorId: string) {
    return stockDistributorBatch
      .query()
      .withAllRecursive(3)
      .where('stock_distributor_id', stockDistributorId)
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
  async putMobile(params: any) {
    const resp = await nSQL('stockDistributorBatchs')
      .query('upsert', JSON.parse(JSON.stringify(params)))
      .exec();
    stockDistributorBatch.save(params);
    return resp;
  },

  getMobile() {
    return nSQL().onConnected(() => {
      nSQL('stockDistributorBatchs')
        .query('select')
        .exec()
        .then((result) => {
          console.log(result);
          stockDistributorBatch.save(result);
          return result;
        });
    });
  },

  localDbGetAll() {
    return nSQL('stockDistributorBatchs')
      .query('select')
      .exec()
      .then((result) => {
        return result;
      });
  },

  localDbGetUsedStock(reportParams: any) {
    return nSQL('stockDistributorBatchs')
      .query('select')
      .where(['drug.clinicalService.id', '=', reportParams.clinicalService])
      .exec()
      .then((result) => {
        console.log(result);
        return result;
      });
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    stockDistributorBatch.flush();
  },
};
