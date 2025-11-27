import { useRepo } from 'pinia-orm';
import Stock from 'src/stores/models/stock/Stock';
import api from '../apiService/apiService';
import moment from 'moment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import StockEntranceService from '../stockEntranceService/StockEntranceService';
import packagedDrugStockService from '../packagedDrugStock/packagedDrugStockService';
import InventoryStockAdjustmentService from '../stockAdjustment/InventoryStockAdjustmentService';
import StockReferenceAdjustmentService from '../stockAdjustment/StockReferenceAdjustmentService';
import clinicService from '../clinicService/clinicService';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();

const stock = useRepo(Stock);
const stockDexie = db[Stock.entity];

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

let stockMobileCache: any[] = [];

const setStockMobileCache = (rows: any[]) => {
  stockMobileCache = rows.map((row) => clone(row));
};

const getStockMobileCache = () => stockMobileCache.map((row) => clone(row));

const upsertStockCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockMobileCache.findIndex((item) => item.id === payload.id);
    if (index >= 0) {
      stockMobileCache.splice(index, 1, payload);
    } else {
      stockMobileCache.push(payload);
    }
  });
};

const removeStockFromCache = (id: string) => {
  stockMobileCache = stockMobileCache.filter((entry) => entry.id !== id);
};

const refreshStockMobileCache = async () => {
  const rows = await stockDexie.toArray();
  setStockMobileCache(rows);
  return getStockMobileCache();
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
  get(offset: number, clincId: any) {
    if (!isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset, clincId);
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

  async getFromBackEnd(offset: number, clinicId: any) {
    if (offset >= 0) {
      return await api()
        .get('/stock/clinic/' + clinicId + '?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            stock.save(resp.data);
          }
          this.addBulkMobile(resp.data);
          console.log('Data synced from backend: stock');
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

  // Local Storage Pinia
  newInstanceEntity() {
    return stock.getModel().$newInstance();
  },
  async apiSave(stock: any) {
    return api().post('/stock', stock);
  },

  async apiRemove(id: any) {
    return api().delete(`/stock/${id}`);
  },

  async apiUpdate(stock: any) {
    return api().patch('/stock/' + stock.id, stock);
  },

  async apiGetAll(offset: number, max: number) {
    return api().get('/stock?offset=' + offset + '&max=' + max);
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number) {
    if (offset >= 0) {
      return api()
        .get('/stock/clinic/' + clinicId + '?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            stock.save(resp.data);
            offset = offset + 100;
            this.apiGetAllByClinicIdWeb(clinicId, offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  // PINIA
  getStockByDrug(drugId: string, clinicId: any) {
    if (isMobile.value && !isOnline.value) {
      const filtered = getStockMobileCache().filter((entry) => {
        const drugMatch =
          String(entry.drug_id) === String(drugId) ||
          String(entry.drug?.id) === String(drugId);
        const clinicMatch =
          entry.clinic_id === clinicId || entry.clinic?.id === clinicId;

        console.log('Entry:', {
          drug_id: entry.drug_id,
          'drug?.id': entry.drug?.id,
          clinic_id: entry.clinic_id,
          'clinic?.id': entry.clinic?.id,
          drugMatch,
          clinicMatch,
          bothMatch: drugMatch && clinicMatch,
        });

        return drugMatch && clinicMatch;
      });
      return getStockMobileCache()
        .filter(
          (entry) =>
            (entry.drug_id === drugId || entry.drug?.id === drugId) &&
            (entry.clinic_id === clinicId || entry.clinic?.id === clinicId)
        )
        .sort((a, b) => {
          const dateCompare = String(b.expireDate || '').localeCompare(
            String(a.expireDate || '')
          );
          if (dateCompare !== 0) {
            return dateCompare;
          }
          return (b.stockMoviment || 0) - (a.stockMoviment || 0);
        });
    }
    return stock
      .where('drug_id', drugId)
      .where('clinic_id', clinicId)
      .orderBy('expireDate', 'desc')
      .orderBy('stockMoviment', 'desc')
      .get();
  },

  getValidStockWithDrug() {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache()
        .filter((entry) =>
          moment(entry.expireDate, 'YYYY-MM-DD').isAfter(
            moment().format('YYYY-MM-DD')
          )
        )
        .sort((a, b) =>
          String(b.expireDate || '').localeCompare(String(a.expireDate || ''))
        );
    }
    return stock
      .with('drug')
      .where((stock: any) => {
        return moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
          moment().format('YYYY-MM-DD')
        );
      })
      .orderBy('expireDate', 'desc')
      .get();
  },

  getValidStockByDrug(drug: any, clinicId: any) {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache()
        .filter((entry) => {
          const matchesDrug =
            entry.drug_id === drug.id || entry.drug?.id === drug.id;
          const matchesClinic =
            entry.clinic_id === clinicId || entry.clinic?.id === clinicId;
          const validDate = moment(entry.expireDate, 'YYYY-MM-DD').isAfter(
            moment().format('YYYY-MM-DD')
          );
          return matchesDrug && matchesClinic && validDate;
        })
        .sort((a, b) =>
          String(b.expireDate || '').localeCompare(String(a.expireDate || ''))
        );
    }
    const stocks = stock
      .where('drug_id', drug.id)
      .where('clinic_id', clinicId)
      .where((stock: any) => {
        return moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
          moment().format('YYYY-MM-DD')
        );
      })
      .orderBy('expireDate', 'desc')
      .get();
    return stocks;
  },

  getValidStock() {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache()
        .filter((entry) =>
          moment(entry.expireDate, 'YYYY-MM-DD').isAfter(
            moment().format('YYYY-MM-DD')
          )
        )
        .sort((a, b) =>
          String(a.drug_id || a.drug?.id || '').localeCompare(
            String(b.drug_id || b.drug?.id || '')
          )
        );
    }
    return stock
      .withAllRecursive(1)
      .where((stock: any) => {
        return moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
          moment().format('YYYY-MM-DD')
        );
      })
      .orderBy('drug_id')
      .groupBy('drug_id')
      .get();
  },

  getValidStockByDrugAndPickUpDate(drugId: string, pickupDate: string) {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache()
        .filter((entry) => {
          const matchesDrug =
            entry.drug_id === drugId || entry.drug?.id === drugId;
          const matchesClinic =
            entry.clinic_id === clinicService.currClinic().id ||
            entry.clinic?.id === clinicService.currClinic().id;
          return (
            matchesDrug &&
            matchesClinic &&
            entry.expireDate > pickupDate &&
            (entry.stockMoviment || 0) > 0
          );
        })
        .sort((a, b) =>
          String(a.expireDate || '').localeCompare(String(b.expireDate || ''))
        );
    }
    return stock
      .where('drug_id', drugId)
      .where('clinic_id', clinicService.currClinic().id)
      .where((stock: any) => {
        return stock.expireDate > pickupDate && stock.stockMoviment > 0;
      })
      .orderBy('expireDate', 'asc')
      .get();
  },

  getStockList(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache().find((entry) => entry.id === id) ?? null;
    }
    return stock
      .query()
      .with('clinic')
      .with('entrance')
      .with('packagedDrugStocks')
      .with('adjustments')
      .with('drug')
      .where('id', id)
      .first();
  },

  isBatchNumberExists(stockObj: any) {
    if (isMobile.value && !isOnline.value) {
      return (
        getStockMobileCache().filter(
          (entry) =>
            entry.batchNumber === stockObj.batchNumber &&
            (entry.entrance_id === stockObj.entrance_id ||
              entry.entrance?.id === stockObj.entrance_id)
        ).length > 0
      );
    }
    const batchNumberList = stock
      .query()
      .where('batchNumber', stockObj.batchNumber)
      .where('entrance_id', stockObj.entrance_id)
      .get();
    return batchNumberList.length > 0;
  },
  getStockById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache().find((entry) => entry.id === id) ?? null;
    }
    return stock
      .query()
      .with('drug')
      .with('clinic')
      .with('entrance')
      .with('center')
      .where('id', id)
      .first();
  },
  // Web
  postWeb(params: string) {
    return api()
      .post('stock', params)
      .then((resp) => {
        stock.save(resp.data);
        return resp.data;
      });
  },

  getWeb(offset: number, clinicId: any) {
    if (offset >= 0) {
      return api()
        .get('stock?offset=' + offset + '&max=100')
        .then((resp) => {
          const stocksResp = resp.data;
          stocksResp.forEach((stockItem) => {
            if (stockItem.clinic.id !== clinicId) {
              stockItem.entrance = null;
              if (!isMobile.value) {
                stock.save(stockItem);
              }
            } else {
              if (!isMobile.value) {
                stock.save(stockItem);
              }
            }
          });
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset, clinicId);
          } else {
            closeLoading();
          }
        });
    }
  },

  getStockDistributorWeb(clinicId: string, offset: number) {
    if (offset >= 0) {
      return api()
        .get(
          'stock/getStocksByStockDistributor/' +
            clinicId +
            '/' +
            offset +
            '/100'
        )
        .then((resp) => {
          const stocksResp = resp.data;

          stocksResp.forEach((stockItem) => {
            stockItem.entrance = null;
            /*
            if (stockItem.clinic.id === clinicService.currClinic().id) {
              stock.save(stockItem);
            }
            */
            if (!isMobile.value) {
              stock.save(stockItem);
            }
          });

          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getStockDistributorWeb(clinicId, offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  async checkStockStatus(
    idPrescribedDrug: any,
    date: any,
    qtyPrescribed: any,
    clinicId: any,
    weeks: any
  ) {
    if (isOnline.value) {
      if (date !== '') {
        return api()
          .get(
            'stock/checkStockStatus/' +
              idPrescribedDrug +
              '/' +
              date +
              '/' +
              qtyPrescribed +
              '/' +
              clinicId +
              '/' +
              weeks
          )
          .then((resp) => {
            closeLoading();
            return resp.data;
          });
      } else {
        return false;
      }
    } else {
      let qtyInStock = 0;
      const stocks = this.getStockByDrug(idPrescribedDrug, clinicId);
      const validStock = stocks.filter((item) => {
        return moment(item.expireDate) >= moment(date);
      });
      if (validStock.length <= 0) {
        return false;
      } else {
        validStock.forEach((item) => {
          qtyInStock = Number(qtyInStock + item.stockMoviment);
        });
        if (qtyInStock < qtyPrescribed) {
          return false;
        } else {
          return true;
        }
      }
    }
  },
  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stock/' + id, params)
      .then((resp) => {
        stock.save(resp.data);
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stock/' + id)
      .then(() => {
        stock.destroy(id);
      });
  },

  //Mobile

  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return stockDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertStockCache(payload);
        return payload;
      }
      // stock.save(payload);
      return payload;
    });
  },

  async putMobile(params: any) {
    const payload = clone(toPlainObject(params));
    return stockDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertStockCache(payload);
        return payload;
      }
      //  stock.save(payload);
      return payload;
    });
  },

  async getMobile() {
    try {
      const rows = await stockDexie.toArray();
      if (isMobile.value && !isOnline.value) {
        setStockMobileCache(rows);
        return getStockMobileCache();
      }
      // stock.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getStocksByIds(stockIds: any) {
    const rows = await stockDexie.where('id').anyOf(stockIds).toArray();
    if (isMobile.value && !isOnline.value) {
      upsertStockCache(rows);
      return rows.map((entry: any) => clone(entry));
    }
    stock.save(rows);
    return rows;
  },

  async getBystockMobile(stockId: any) {
    const stocks = await stockDexie
      .where('id')
      .equalsIgnoreCase(stockId)
      .toArray();
    if (isMobile.value && !isOnline.value) {
      upsertStockCache(stocks);
      return stocks.map((entry: any) => clone(entry));
    }
    return stocks;
  },

  async getStocksByDrugIdMobile(drugId: any) {
    const rows = await stockDexie.toArray();
    const data = rows.filter((row) => row.drug && row.drug.id === drugId);
    if (isMobile.value && !isOnline.value) {
      upsertStockCache(data);
      return data.map((entry: any) => clone(entry));
    }
    return data;
  },

  async deleteMobile(id: any) {
    try {
      await stockDexie.delete(id);
      removeStockFromCache(id);
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetAll() {
    try {
      const rows = await stockDexie.toArray();
      setStockMobileCache(rows);
      return getStockMobileCache();
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetUsedStock(reportParams: any) {
    const collection = stockDexie.filter(
      (stock: Stock) =>
        reportParams.clinicalService === stock?.clinicalService?.id
    );
    return await collection.toArray().then((rows: any) => {
      upsertStockCache(rows);
      return rows.map((entry: any) => clone(entry));
    });
  },

  localDbGetById(stock: any) {
    return stockDexie
      .where('id')
      .equalsIgnoreCase(stock.id)
      .then((rows: any) => {
        upsertStockCache(rows);
        return rows.map((entry: any) => clone(entry));
      });
  },

  async localDbGetByStockEntranceId(stockEntrance: any) {
    const collection = stockDexie.filter(
      (stock: Stock) => stock.entrance.id === stockEntrance.id
    );
    return await collection.toArray().then((rows: any) => {
      upsertStockCache(rows);
      return rows.map((entry: any) => clone(entry));
    });
  },

  async localDbGetByDrug(drug: any) {
    const collection = stockDexie.filter(
      (stock: Stock) => stock.drug.id === drug.id
    );
    return await collection.toArray().then((rows: any) => {
      upsertStockCache(rows);
      return rows.map((entry: any) => clone(entry));
    });
  },

  async hasStockMobile(drugg: any) {
    try {
      const rows = await stockDexie.toArray();
      const stocks = rows.filter((row) => row.drug && row.drug.id === drugg.id);
      return stocks.length > 0;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile(payload?: any[]) {
    const stocksFromPinia = payload
      ? payload.map((entry) => clone(entry))
      : this.getAllFromStorage();
    return stockDexie
      .bulkPut(stocksFromPinia)
      .then(() => {
        upsertStockCache(stocksFromPinia);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getStockMobileCache();
    }
    return stock.all();
  },

  async getAllWithPackagedDrugStocksAndAdjustmentsFromDexie() {
    const endDate = moment(new Date()).format('YYYY-MM-DD');
    const stocks = await stockDexie
      .where('expireDate')
      .aboveOrEqual(endDate)
      // .orderBy('expireDate')
      .toArray();

    const stocksIds = stocks.map((stock: any) => stock.id);
    const entranceIds = stocks.map(
      (stock: any) => stock.entrance_id ?? stock.entranceId
    );

    const [
      entrances,
      packagedDrugStockList,
      inventoryStockAdjustmentsList,
      referedStockAdjustmentsList,
    ] = await Promise.all([
      StockEntranceService.getAllByIDsFromDexie(entranceIds),
      packagedDrugStockService.getAllByStockIDsFromDexie(stocksIds),
      InventoryStockAdjustmentService.getAllByStockIDsFromDexie(stocksIds),
      StockReferenceAdjustmentService.getAllByStockIDsFromDexie(stocksIds),
    ]);

    stocks.map((stock: any) => {
      stock.entrance = entrances.find(
        (entrance: any) => entrance.id === stock.entrance_id
      );
      stock.packagedDrugStocks = packagedDrugStockList.filter(
        (packagedDrugStock: any) => packagedDrugStock.stock_id === stock.id
      );
      stock.adjustments = inventoryStockAdjustmentsList.filter(
        (stockAdjustment: any) => stockAdjustment.adjusted_stock_id === stock.id
      );
      stock.referedAdjustments = referedStockAdjustmentsList.filter(
        (referedStockAdjustment: any) =>
          referedStockAdjustment.adjusted_stock_id === stock.id
      );
    });
    upsertStockCache(stocks);
    return stocks.map((entry: any) => clone(entry));
  },

  async getValidStockByDrugAndPickUpDateOnline(
    drugId: string,
    pickupDate: any
  ) {
    if (isMobile.value && !isOnline.value) {
      return this.getValidStockByDrugAndPickUpDate(drugId, pickupDate);
    } else {
      return api()
        .get('stock/getValidStocks/' + drugId + '/' + pickupDate)
        .then((resp) => {
          closeLoading();
          stock.save(resp.data);
          return resp.data;
        });
    }
  },

  // Local Storage Pinia
  deleteAllFromStorage() {
    stock.flush();
  },
  deleteAllFromDexie() {
    stockMobileCache = [];
    stockDexie.clear();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockMobileCache();
  },
  getStockMobileCache() {
    return getStockMobileCache();
  },
};
