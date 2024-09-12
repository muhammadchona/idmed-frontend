import api from '../apiService/apiService';
import stockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import { useRepo } from 'pinia-orm';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const stockOperationRepo = useRepo(stockOperationType);
const stockOperationDexie = stockOperationType.entity;

export default {
  // Axios API call static async

  get(offset: number) {
    if (!isOnline.value) {
      return db[stockOperationDexie].toArray().then((result: any) => {
        console.log(result);
        stockOperationRepo.save(result);
        return result;
      });
    } else {
      if (offset >= 0) {
        showloading();
        return api()
          .get('/stockOperationType?offset=' + offset + '&limit=100')
          .then((resp) => {
            stockOperationRepo.save(resp.data);
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
              setTimeout(this.get, 2);
            } else {
              closeLoading();
            }
          });
      }
    }
  },

  //mobile
  addBulkMobile(params: string) {
    return db[stockOperationDexie]
      .bulkPut(params)
      .then(() => {
        stockOperationRepo.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async apiGetAll(offset: number, max: number) {
    return api().get('/stockOperationType?offset=' + offset + '&max=' + max);
  },

  getStockOperatinTypeByCode(code: string) {
    return stockOperationRepo.query().where('code', code).first();
  },
  getStockOperatinTypeById(Id: string) {
    return stockOperationRepo.query().where('id', Id).first();
  },
  //Pinia

  savePinia(st: any) {
    stockOperationRepo.save(st);
  },
};
