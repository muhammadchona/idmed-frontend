import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import StockLevel from 'src/stores/models/stocklevel/StockLevel';

const stockLevel = useRepo(StockLevel);
const stockLevelDexie = db[StockLevel.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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

let stockLevelMobileCache: any[] = [];

const setStockLevelMobileCache = (rows: any[]) => {
  stockLevelMobileCache = rows.map((row) => clone(row));
};

const getStockLevelMobileCache = () =>
  stockLevelMobileCache.map((row) => clone(row));

const upsertStockLevelCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockLevelMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      stockLevelMobileCache.splice(index, 1, payload);
    } else {
      stockLevelMobileCache.push(payload);
    }
  });
};

const removeStockLevelFromCache = (id: string) => {
  stockLevelMobileCache = stockLevelMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshStockLevelMobileCache = async () => {
  const rows = await stockLevelDexie.toArray();
  setStockLevelMobileCache(rows);
  return getStockLevelMobileCache();
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('stockLevel', params)
      .then((resp) => {
        if (!isMobile.value) {
          stockLevel.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          stockLevelDexie
            .put(payload)
            .then(() => upsertStockLevelCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockLevel?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            stockLevel.save(resp.data);
          }
          if (isMobile.value) {
            stockLevelDexie
              .bulkPut(resp.data.map((entry: any) => clone(entry)))
              .then(() => upsertStockLevelCache(resp.data))
              .catch((error) => console.log(error));
          }
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  getStockLevelByClinicAndDrugWeb(clinicId: any, drugId: any) {
    return api()
      .get('stockLevel/getStockLevelByClinicAndDrug/' + clinicId + '/' + drugId)
      .then((resp) => {
        closeLoading();
        return resp.data;
      });
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('stockLevel/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          stockLevel.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          stockLevelDexie
            .put(payload)
            .then(() => upsertStockLevelCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('stockLevel/' + uuid)
      .then(() => {
        if (!isMobile.value) {
          stockLevel.destroy(uuid);
        }
        if (isMobile.value) {
          stockLevelDexie
            .delete(uuid)
            .then(() => removeStockLevelFromCache(uuid))
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return stockLevelDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockLevelCache(payload);
          return payload;
        }
        stockLevel.save(payload);
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return stockLevelDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockLevelCache(payload);
          return payload;
        }
        stockLevel.save(payload);
        // alertSucess('O Registo foi efectuado com sucesso');
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    return stockLevelDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value) {
          setStockLevelMobileCache(rows);
          return getStockLevelMobileCache();
        }
        stockLevel.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    return stockLevelDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value) {
          removeStockLevelFromCache(paramsId);
        } else {
          stockLevel.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    const payload = Array.isArray(params)
      ? params.map((entry: any) => clone(entry))
      : [clone(params)];
    return stockLevelDexie
      .bulkPut(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockLevelCache(payload);
        } else {
          stockLevel.save(payload);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockLevel.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllstockLevels() {
    if (isMobile.value) {
      return getStockLevelMobileCache();
    }
    return stockLevel.get();
  },
  isStockLevelExists(clinicSectorId: any, drugId: any) {
    const list = isMobile.value
      ? getStockLevelMobileCache().filter((entry) => {
          const clinicMatch =
            entry.clinic_id === clinicSectorId ||
            entry.clinic?.id === clinicSectorId;
          const drugMatch =
            entry.drug_id === drugId || entry.drug?.id === drugId;
          return clinicMatch && drugMatch;
        })
      : stockLevel
          .query()
          .where('clinic_id', clinicSectorId)
          .where('drug_id', drugId)
          .get();
    return list.length > 0;
  },

  getStockLevel(clinicSectorId: any, drugId: any) {
    if (isMobile.value) {
      return (
        getStockLevelMobileCache().find((entry) => {
          const clinicMatch =
            entry.clinic_id === clinicSectorId ||
            entry.clinic?.id === clinicSectorId;
          const drugMatch =
            entry.drug_id === drugId || entry.drug?.id === drugId;
          return clinicMatch && drugMatch;
        }) ?? null
      );
    }
    const obj = stockLevel
      .query()
      .where('clinic_id', clinicSectorId)
      .where('drug_id', drugId)
      .first();
    return obj;
  },
  deleteAllFromStorage() {
    if (isMobile.value) {
      stockLevelMobileCache = [];
      return stockLevelDexie.clear().catch((error: any) => {
        console.log(error);
        throw error;
      });
    }
    stockLevel.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockLevelMobileCache();
  },
};
