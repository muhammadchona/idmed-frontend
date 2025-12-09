import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import packagedDrugService from '../packagedDrug/packagedDrugService';

const packagedDrugStock = useRepo(PackagedDrugStock);
const packagedDrugStockDexie = db[PackagedDrugStock.entity];

const { closeLoading } = useLoading();
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

let packagedDrugStockMobileCache: any[] = [];

const setPackagedDrugStockMobileCache = (rows: any[]) => {
  packagedDrugStockMobileCache = rows.map((row) => clone(row));
};

const getPackagedDrugStockMobileCache = () =>
  packagedDrugStockMobileCache.map((row) => clone(row));

const upsertPackagedDrugStockCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = packagedDrugStockMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      packagedDrugStockMobileCache.splice(index, 1, payload);
    } else {
      packagedDrugStockMobileCache.push(payload);
    }
  });
};

const removePackagedDrugStockFromCache = (id: string) => {
  packagedDrugStockMobileCache = packagedDrugStockMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshPackagedDrugStockMobileCache = async () => {
  const rows = await packagedDrugStockDexie.toArray();
  setPackagedDrugStockMobileCache(rows);
  return getPackagedDrugStockMobileCache();
};

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('packagedDrugStock', params);
      if (!isMobile.value) {
        packagedDrugStock.save(resp.data);
      }
      if (isMobile.value && !isOnline.value) {
        const payload = clone(resp.data);
        packagedDrugStockDexie
          .put(payload)
          .then(() => upsertPackagedDrugStockCache(payload))
          .catch((error) => console.log(error));
      }
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrugStock?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            packagedDrugStock.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            packagedDrugStockDexie
              .bulkPut(resp.data.map((entry: any) => clone(entry)))
              .then(() => upsertPackagedDrugStockCache(resp.data))
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
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('packagedDrugStock/' + uuid, params);
      if (!isMobile.value) {
        packagedDrugStock.save(resp.data);
      }
      if (isMobile.value && !isOnline.value) {
        const payload = clone(resp.data);
        packagedDrugStockDexie
          .put(payload)
          .then(() => upsertPackagedDrugStockCache(payload))
          .catch((error) => console.log(error));
      }
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('packagedDrugStock/' + uuid);
      if (!isMobile.value) {
        packagedDrugStock.destroy(uuid);
      }
      if (isMobile.value && !isOnline.value) {
        packagedDrugStockDexie
          .delete(uuid)
          .then(() => removePackagedDrugStockFromCache(uuid))
          .catch((error) => console.log(error));
      }
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return packagedDrugStockDexie
      .put(payload)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          upsertPackagedDrugStockCache(payload);
          return payload;
        }
        // packagedDrugStock.save(payload);
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return packagedDrugStockDexie
      .put(payload)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          upsertPackagedDrugStockCache(payload);
          return payload;
        }
        packagedDrugStock.save(payload);
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    return packagedDrugStockDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value && !isOnline.value) {
          setPackagedDrugStockMobileCache(rows);
          return getPackagedDrugStockMobileCache();
        }
        packagedDrugStock.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    return packagedDrugStockDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          removePackagedDrugStockFromCache(paramsId);
        } else {
          packagedDrugStock.destroy(paramsId);
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
    return packagedDrugStockDexie
      .bulkPut(payload)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          upsertPackagedDrugStockCache(payload);
        } else {
          packagedDrugStock.save(payload);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async getAllByStockIDsFromDexie(ids: string[]) {
    const collection = packagedDrugStockDexie
      .orderBy('creationDate')
      .reverse()
      .filter((packagedDrugStock: PackagedDrugStock) => {
        const stockId =
          packagedDrugStock?.stock_id ?? packagedDrugStock?.stock?.id ?? '';
        return ids.includes(stockId);
      });
    const packagedDrugStocks = await collection.toArray();

    const packagedDrugIds = Array.from(
      new Set(
        packagedDrugStocks
          .map(
            (packagedDrugStock: any) =>
              packagedDrugStock?.packagedDrug_id ??
              packagedDrugStock?.packagedDrug?.id ??
              ''
          )
          .filter((id: string) => !!id)
      )
    );

    const [packagedDrugList] = await Promise.all([
      packagedDrugService.getAllPackagedDrugByIDsFromDexie(packagedDrugIds),
    ]);

    packagedDrugStocks.map((packagedDrugStock: any) => {
      const packagedDrugId =
        packagedDrugStock?.packagedDrug_id ??
        packagedDrugStock?.packagedDrug?.id;
      packagedDrugStock.packagedDrug =
        packagedDrugList.find(
          (packagedDrug: any) => packagedDrug.id === packagedDrugId
        ) ?? packagedDrugStock.packagedDrug;
    });

    if (isMobile.value && !isOnline.value) {
      upsertPackagedDrugStockCache(packagedDrugStocks);
      return packagedDrugStocks.map((entry: any) => clone(entry));
    }
    packagedDrugStock.save(packagedDrugStocks);
    return packagedDrugStocks;
  },
  async apiGetAll() {
    return await api().get('/packagedDrugStock?offset=' + 0 + '&max=' + 200);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrugStock.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPackagedDrugStockMobileCache();
    }
    return packagedDrugStock.all();
  },
  deleteAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      packagedDrugStockMobileCache = [];
      return packagedDrugStockDexie.clear();
    }
    packagedDrugStock.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPackagedDrugStockMobileCache();
  },
};
