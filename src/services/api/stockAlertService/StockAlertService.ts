import { useRepo } from 'pinia-orm';
import StockAlert from 'src/stores/models/stockAlert/StockAlert';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import drugService from '../drugService/drugService';
import { useStock } from 'src/composables/stock/StockMethod';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import StockService from '../stockService/StockService';
import patientVisitService from '../patientVisit/patientVisitService';
import StockMethods from 'src/methods/stock/StockMethods';

const { showloading, closeLoading } = useLoading();

const stockMethod = useStock();
const { isOnline, isMobile } = useSystemUtils();
const stockAlert = useRepo(StockAlert);
const stockAlertDexie = StockAlert.entity;

export default {
  // Axios API call
  apiSave(params: string) {
    return api()
      .post('stockAlert', params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockAlert?offset=' + offset)
        .then((resp) => {
          stockAlert.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockAlert/' + id, params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockAlert/' + id)
      .then(() => {
        stockAlert.destroy(id);
      });
  },

  apiFetchById(id: string) {
    return api()
      .get('/stockAlert/' + id)
      .then((resp) => {
        stockAlert.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },
  async apiGetStockAlertAll(clinicId: string) {
    if (isMobile.value) {
      const response = await this.localDbGetStockAlertMobile();
      stockAlert.save(response);
      return response;
    } else {
      await api()
        .get(`/dashBoard/getStockAlertAll/${clinicId}`)
        .then((resp) => {
          stockAlert.save(resp.data);
          closeLoading();
          return resp.data;
        });
    }
  },

  apiGetStockAlert(clinicId: string, serviceCode: string) {
    return api().get(`/dashBoard/getStockAlert/${clinicId}/${serviceCode}`);
  },
  getStockAlertsByClinic() {
    const items = stockAlert.withAllRecursive(2).get();
    closeLoading();
    return items;
  },
  saveStockAlert(param: any) {
    stockAlert.save(param);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockAlert.getModel().$newInstance();
  },

  // Mobile
  async localDbAddOrUpdate(targetCopy: any) {
    return db[stockAlertDexie]
      .add(JSON.parse(JSON.stringify(targetCopy)))
      .then(() => {
        stockAlert.save(JSON.parse(JSON.stringify(targetCopy)));
      });
  },

  //mobile
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockAlert?offset=' + offset + '&max=100')
        .then((resp) => {
          stockAlert.addBulkMobile(resp.data);
          console.log('Data synced from backend: stockAlert');
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

  addBulkMobile(params: string) {
    return db[stockAlertDexie]
      .bulkAdd(params)
      .then(() => {
        stockAlert.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAll() {
    try {
      const rows = await db[stockAlertDexie].toArray();
      stockAlert.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetStockAlertMobile() {
    const listStockAlert = [];
    const drugList = drugService.getActiveDrugs();
    for (const drug of drugList) {
      const hasStock = await StockService.hasStockMobile(drug);
      if (hasStock) {
        const stockAlert = new StockAlert();
        const balance = await stockMethod.localDbGetStockBalanceByDrug(drug);
        const drugQuantitySupplied =
          await stockMethod.localDbGetQuantitySuppliedByDrug(drug);
        stockAlert.id = drug.id;
        stockAlert.balance = balance;
        stockAlert.drugName = drug.name;
        stockAlert.drug = drug;
        stockAlert.avgConsuption = drugQuantitySupplied / 3;
        if (drugQuantitySupplied === 0) {
          stockAlert.state = 'Sem Consumo';
        } else if (stockAlert.balance > drugQuantitySupplied / 3) {
          stockAlert.state = 'Acima do Consumo Máximo';
        } else if (stockAlert.balance > drugQuantitySupplied / 3) {
          stockAlert.state = 'Ruptura de Stock';
        }
        listStockAlert.push(stockAlert);
      }
    }

    return listStockAlert;
  },
};
