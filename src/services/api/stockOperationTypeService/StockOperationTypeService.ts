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

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const normalizePayload = (payload: any) => {
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

let stockOperationMobileCache: any[] = [];

const setStockOperationMobileCache = (rows: any[]) => {
  stockOperationMobileCache = rows.map((row) => clone(row));
};

const getStockOperationMobileCache = () =>
  stockOperationMobileCache.map((row) => clone(row));

const refreshStockOperationMobileCache = async () => {
  const rows = await stockOperationDexie.toArray();
  setStockOperationMobileCache(rows);
  return getStockOperationMobileCache();
};

const findStockOperationType = (predicate: (entry: any) => boolean) =>
  getStockOperationMobileCache().find(predicate) ?? null;

export default {
  // Axios API call static async

  async get(offset: number) {
    if (!isOnline.value) {
      return stockOperationDexie.toArray().then((result: any) => {
        if (isMobile.value) {
          setStockOperationMobileCache(result);
          return getStockOperationMobileCache();
        }
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
    const payload = normalizePayload(params);
    return stockOperationDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshStockOperationMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return stockOperationDexie
        .toArray()
        .then((rows: any) => {
          stockOperationRepo.save(rows);
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    return stockOperationDexie
      .toArray()
      .then((rows: any) => {
        setStockOperationMobileCache(rows);
        return getStockOperationMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  async apiGetAll(offset: number, max: number) {
    return api().get('/stockOperationType?offset=' + offset + '&max=' + max);
  },

  getStockOperatinTypeByCode(code: string) {
    if (isMobile.value && !isOnline.value) {
      return findStockOperationType((entry) => entry.code === code);
    }
    return stockOperationRepo.query().where('code', code).first();
  },
  getStockOperatinTypeById(Id: string) {
    if (isMobile.value && !isOnline.value) {
      return findStockOperationType((entry) => entry.id === Id);
    }
    return stockOperationRepo.query().where('id', Id).first();
  },
  async getAllByIDsFromDexie(ids: []) {
    return await stockOperationDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  //Pinia
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getStockOperationMobileCache();
    }
    return stockOperationRepo.all();
  },
  savePinia(st: any) {
    stockOperationRepo.save(st);
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockOperationMobileCache();
  },
};
