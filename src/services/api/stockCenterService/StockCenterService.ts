import { useRepo } from 'pinia-orm';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from 'src/stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const stockCenter = useRepo(StockCenter);
const stockCenterDexie = StockCenter.entity;

export default {
  // Axios API call
  async apiSave(params: string) {
    const resp = await api().post('stockCenter', params);
    stockCenter.save(resp.data);
  },

  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },

  async apiUpdate(id: number, params: string) {
    const resp = await api().patch('stockCenter/' + id, params);
    stockCenter.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('stockCenter/' + id);
    stockCenter.destroy(id);
  },

  async apiFetchById(id: string) {
    const resp = await api().get('/stockCenter/' + id);
    stockCenter.save(resp.data);
    if (resp.data.length > 0) {
      setTimeout(this.get, 2);
    }
  },

  //web

  getWeb(offset: number) {
    showloading();
    if (offset >= 0) {
      return api()
        .get('stockCenter?offset=' + offset)
        .then((resp) => {
          stockCenter.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  //mobile
  getMobile() {
    return db[stockCenterDexie]
      .toArray()
      .then((rows: any) => {
        stockCenter.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockCenter?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            this.addBulkMobile(resp.data);
            console.log('Data synced from backend: stockCenter');
            offset = offset + 100;
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
    return db[stockCenterDexie]
      .bulkAdd(params)
      .then(() => {
        stockCenter.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockCenter.getModel().$newInstance();
  },

  getStockCenter() {
    return stockCenter.withAllRecursive(3).where('prefered', true).first();
  },
};
