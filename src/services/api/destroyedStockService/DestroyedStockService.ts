import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import destroyedStock from 'src/stores/models/stockdestruction/DestroyedStock';

import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from 'src/stores/dexie';
import DestroyedStock from 'src/stores/models/stockdestruction/DestroyedStock';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const destroyedStockRepo = useRepo(destroyedStock);
const destroyedStockDexie = DestroyedStock.entity;

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
  patch(params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(params);
    }
  },

  async delete(id: string) {
    if (isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },

  postWeb(params: string) {
    return api()
      .post('destroyedStock', params)
      .then((resp) => {
        destroyedStockRepo.save(resp.data);
      });
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('destroyedStock?offset=' + offset)
        .then((resp) => {
          destroyedStockRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  getAllByClinic(clinicId: any, offset: number) {
    if (offset >= 0) {
      return api()
        .get(
          'destroyedStock/clinic/' + clinicId + '?offset=' + offset + '&max=100'
        )
        .then((resp) => {
          destroyedStockRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  deleteWeb(id: any) {
    return api()
      .delete('destroyedStock/' + id)
      .then(() => {
        destroyedStockRepo.destroy(id);
      });
  },
  async apiUpdateWeb(destroyedStock: any) {
    return await api().patch('/destroyedStock', destroyedStock);
  },
  // Mobile

  addMobile(params: string) {
    return db[destroyedStockDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        destroyedStockRepo.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async putMobile(params: any) {
    return db[destroyedStockDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        destroyedStockRepo.save(JSON.parse(JSON.stringify(params)));
      });
  },

  getMobile() {
    return db[destroyedStockDexie]
      .toArray()
      .then((rows: any) => {
        destroyedStockRepo.save(rows);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  getDestroyedStocksMobile() {
    const rows = db[destroyedStockDexie].toArray();
    return rows;
  },

  async getReferedStockMovimentsMobile() {
    const rows = await db[destroyedStockDexie].toArray();
    return rows;
  },

  getBystockMobile(stock: any) {
    return nSQL().onConnected(() => {
      nSQL('destroyedStocks')
        .query('select')
        .where(['stocks[id]', '=', stock.id])
        .exec()
        .then((result) => {
          console.log(result);
          destroyedStockRepo.save(result);
        });
    });
  },

  async deleteMobile(id: any) {
    const resp = await nSQL('destroyedStocks')
      .query('delete')
      .where(['id', '=', id])
      .exec();
    destroyedStockRepo.destroy(id);
    return resp;
  },

  async localDbGetAll() {
    return nSQL(this.entity)
      .query('select')
      .exec()
      .then((result) => {
        console.log(result);
        // DestroyedStock.insertOrUpdate({ data: result })
        return result;
      });
  },
};
