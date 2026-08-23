import { useRepo } from 'pinia-orm';
import StockAlert from 'src/stores/models/stockAlert/StockAlert';
import api from '../apiService/apiService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import drugService from '../drugService/drugService';
import { useStock } from 'src/composables/stock/StockMethod';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import StockService from '../stockService/StockService';

const { showloading, closeLoading } = useLoading();

const stockMethod = useStock();
const { isOnline, isMobile } = useSystemUtils();
const stockAlert = useRepo(StockAlert);
const stockAlertDexie = db[StockAlert.entity];

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
      let response = await this.localDbGetCachedStockAlertMobile(clinicId);
      // On a tablet, Wi-Fi connectivity does not mean the installation is in
      // online mode. Offline installations must only read the cached snapshot
      // or calculate from Dexie; backend access is reserved for the explicit
      // data-download flow.
      if (response.length === 0 && isOnline.value) {
        try {
          response = await this.syncMobileStockAlertSnapshot(clinicId, 2000);
        } catch (error) {
          console.warn(
            'Unable to refresh the mobile stock-alert snapshot',
            error
          );
        }
      }
      if (response.length === 0) {
        response = await this.localDbGetStockAlertMobile(clinicId);
      } else {
        response = await this.applyMobileStockMovementDelta(response, clinicId);
      }
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
    return stockAlertDexie
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
    return stockAlertDexie
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
      const rows = await stockAlertDexie.toArray();
      stockAlert.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async localDbGetCachedStockAlertMobile(clinicId: string) {
    const rows = await stockAlertDexie.toArray();
    return rows.filter((item: any) => item.clinicId === clinicId);
  },

  async applyMobileStockMovementDelta(snapshot: any[], clinicId: string) {
    return await Promise.all(
      snapshot.map(async (item: any) => {
        const currentMovement =
          await stockMethod.localDbGetCurrentStockMovementByDrug(
            { id: item.id },
            clinicId
          );
        const baselineMovement = Number(
          item.stockMovementBaseline ?? currentMovement
        );
        const balance =
          Number(item.balance ?? 0) + currentMovement - baselineMovement;
        const avgConsuption = Number(item.avgConsuption ?? 0);
        let state = 'Stock Normal';
        if (avgConsuption === 0) state = 'Sem Consumo';
        else if (balance > avgConsuption) state = 'Acima do Consumo Máximo';
        else if (balance < avgConsuption) state = 'Ruptura de Stock';

        return { ...item, balance, state };
      })
    );
  },

  async syncMobileStockAlertSnapshot(clinicId: string, timeout = 10000) {
    const requestStartedAt = performance.now();
    const response = await api().get(
      `/dashBoard/getStockAlertAll/${clinicId}`,
      {
        timeout,
        suppressGlobalNetworkNotification: true,
      } as any
    );
    console.info('Mobile stock-alert backend snapshot received.', {
      clinicId,
      itemCount: Array.isArray(response.data) ? response.data.length : 0,
      elapsedMs: Math.round(performance.now() - requestStartedAt),
    });
    const drugIds = response.data.map((item: any) => item.id).filter(Boolean);
    const drugs = await drugService.getDrugsByIds(drugIds);
    const drugsById = new Map(drugs.map((item: any) => [item.id, item]));
    const snapshot = await Promise.all(
      response.data.map(async (item: any) => {
        const drug = { id: item.id };
        const currentMovement =
          await stockMethod.localDbGetCurrentStockMovementByDrug(
            drug,
            clinicId
          );
        const pendingQuantity =
          await stockMethod.localDbGetPendingQuantitySuppliedByDrug(drug);
        return {
          id: item.id,
          drug: {
            id: item.id,
            name:
              typeof item.drug === 'string'
                ? item.drug
                : item.drug?.name ?? drugsById.get(item.id)?.name ?? '',
          },
          balance: item.balance,
          avgConsuption: item.avgConsuption,
          state: item.state,
          clinicId,
          // The backend snapshot excludes unsent tablet dispensations. Their
          // quantity is folded into the baseline so subsequent local changes
          // remain visible without changing the backend calculation.
          stockMovementBaseline: currentMovement + pendingQuantity,
        };
      })
    );

    await stockAlertDexie.clear();
    if (snapshot.length > 0) await stockAlertDexie.bulkPut(snapshot);
    stockAlert.flush();
    stockAlert.save(snapshot);
    return snapshot;
  },

  async localDbGetStockAlertMobile(clinicId: string) {
    const listStockAlert = [];
    const drugList = drugService.getActiveDrugs();
    for (const drug of drugList) {
      const hasStock = await StockService.hasStockMobile(drug);
      if (hasStock) {
        const stockAlert = new StockAlert();
        const balance = await stockMethod.localDbGetStockBalanceByDrug(
          drug,
          clinicId
        );
        const drugQuantitySupplied =
          await stockMethod.localDbGetQuantitySuppliedByDrug(drug);
        const avgConsuption = drugQuantitySupplied / 3;
        stockAlert.id = drug.id;
        stockAlert.balance = balance;
        stockAlert.drugName = drug.name;
        stockAlert.drug = drug;
        stockAlert.avgConsuption = Number.isInteger(avgConsuption)
          ? avgConsuption
          : avgConsuption.toFixed(2);
        if (drugQuantitySupplied === 0) {
          stockAlert.state = 'Sem Consumo';
        } else if (stockAlert.balance > drugQuantitySupplied / 3) {
          stockAlert.state = 'Acima do Consumo Máximo';
        } else if (stockAlert.balance < drugQuantitySupplied / 3) {
          stockAlert.state = 'Ruptura de Stock';
        } else {
          stockAlert.state = 'Stock Normal';
        }
        listStockAlert.push(stockAlert);
      }
    }

    return listStockAlert;
  },
};
