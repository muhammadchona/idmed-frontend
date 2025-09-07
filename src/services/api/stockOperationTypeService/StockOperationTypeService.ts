import api from '../apiService/apiService';
import stockOperationType from 'src/stores/models/stockoperation/StockOperationType';
import { useRepo } from 'pinia-orm';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const stockOperationRepo = useRepo(stockOperationType);
const stockOperationDexie = db[stockOperationType.entity];

export default {
  // Axios API call static async

  async get(offset: number) {
    if (!isOnline.value) {
      return stockOperationDexie.toArray().then((result: any) => {
        stockOperationRepo.save(result);
        return result;
      });
    } else {
      if (offset >= 0) {
        showloading();
        return await api()
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
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockOperationType?offset=' + offset + '&max=100')
        .then((resp) => {
          stockOperationRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  //mobile
  addBulkMobile(params: string) {
    return stockOperationDexie
      .bulkPut(params)
      .then(() => {
        stockOperationRepo.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return stockOperationDexie
      .toArray()
      .then((rows: any) => {
        stockOperationRepo.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
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
  async getAllByIDsFromDexie(ids: []) {
    return await stockOperationDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  //Pinia
  getAllFromStorage() {
    return stockOperationRepo.all();
  },
  savePinia(st: any) {
    stockOperationRepo.save(st);
  },
};
