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
          stock.save(resp.data);
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
    return stock
      .where('drug_id', drugId)
      .where('clinic_id', clinicId)
      .orderBy('expireDate', 'desc')
      .orderBy('stockMoviment', 'desc')
      .get();
  },

  getValidStockWithDrug() {
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
    const batchNumberList = stock
      .query()
      .where('batchNumber', stockObj.batchNumber)
      .where('entrance_id', stockObj.entrance_id)
      .get();
    return batchNumberList.length > 0;
  },
  getStockById(id: string) {
    return (
      stock
        .query()
        //Stock.query()
        .with('drug')
        .with('clinic')
        .with('entrance')
        .with('center')
        .where('id', id)
        .first()
    );
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
              stock.save(stockItem);
            } else {
              stock.save(stockItem);
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
            stock.save(stockItem);
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
    return stockDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      stock.save(JSON.parse(JSON.stringify(params)));
    });
  },

  async putMobile(params: any) {
    return stockDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      stock.save(JSON.parse(JSON.stringify(params)));
    });
  },

  async getMobile() {
    try {
      const rows = await stockDexie.toArray();
      stock.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async getStocksByIds(stockIds: any) {
    return stockDexie.where('id').anyOf(stockIds).toArray();
  },

  async getBystockMobile(stockId: any) {
    const stocks = await stockDexie
      .where('id')
      .equalsIgnoreCase(stockId)
      .toArray();
    return stocks;
  },

  async getStocksByDrugIdMobile(drugId: any) {
    const rows = await stockDexie.toArray();
    const data = rows.filter((row) => row.drug && row.drug.id === drugId);
    return data;
  },

  async deleteMobile(id: any) {
    try {
      await stockDexie.delete(id);
      stock.destroy(id);
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetAll() {
    try {
      const rows = await stockDexie.toArray();
      stock.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetUsedStock(reportParams: any) {
    return stockDexie
      .where('drug.clinical_Service_id')
      .equalsIgnoreCase(reportParams.clinicalService)
      .toArray()
      .then((rows: any) => {
        stock.save(rows);
        return rows;
      });
  },

  localDbGetById(stock: any) {
    return stockDexie
      .where('id')
      .equalsIgnoreCase(stock.id)
      .then((rows: any) => {
        stock.save(rows);
        return rows;
      });
  },

  localDbGetByStockEntranceId(stockEntrance: any) {
    return stockDexie
      .where('entrance_id')
      .equalsIgnoreCase(stockEntrance.id)
      .then((rows: any) => {
        stock.save(rows);
        return rows;
      });
  },

  localDbGetByDrug(drug: any) {
    return stockDexie
      .where('drug_id')
      .equalsIgnoreCase(drug.id)
      .then((rows: any) => {
        stock.save(rows);
        return rows;
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
  addBulkMobile(params: string) {
    const stocksFromPinia = this.getAllFromStorage();
    return stockDexie
      .bulkPut(stocksFromPinia)
      .then(() => {
        // stock.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  getAllFromStorage() {
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
    const entranceIds = stocks.map((stock: any) => stock.entrance_id);

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

    return stocks;
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
    stockDexie.clear();
  },
};
