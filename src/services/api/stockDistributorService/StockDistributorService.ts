import { useRepo } from 'pinia-orm';
import StockDistributor from 'src/stores/models/stockDistributor/StockDistributor';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from 'src/stores/dexie';

const { closeLoading, showloading } = useLoading();

const { isMobile, isOnline } = useSystemUtils();
const stockDistributor = useRepo(StockDistributor);
const stockDistributorDexie = db[StockDistributor.entity];

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

let stockDistributorMobileCache: any[] = [];

const setStockDistributorMobileCache = (rows: any[]) => {
  stockDistributorMobileCache = rows.map((row) => clone(row));
};

const getStockDistributorMobileCache = () =>
  stockDistributorMobileCache.map((row) => clone(row));

const upsertStockDistributorCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = stockDistributorMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      stockDistributorMobileCache.splice(index, 1, payload);
    } else {
      stockDistributorMobileCache.push(payload);
    }
  });
};

const removeStockDistributorFromCache = (id: string) => {
  stockDistributorMobileCache = stockDistributorMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshStockDistributorMobileCache = async () => {
  const rows = await stockDistributorDexie.toArray();
  setStockDistributorMobileCache(rows);
  return getStockDistributorMobileCache();
};

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },

  async get(offset: number) {
    return this.getWeb(offset);
  },
  async apiUpdate(id: string, params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: any) {
    if (!isOnline.value) {
      return this.deleteMobile(id);
    } else {
      return this.deleteWeb(id);
    }
  },

  apiFetchById(id: string) {
    if (!isOnline.value) {
      return this.apiFetchByIdMobile(id);
    } else {
      return this.apiFetchByIdWeb(id);
    }
  },
  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    if (!isOnline.value) {
      return this.apiGetAllByClinicIdMobile(clinicId);
    } else {
      return this.apiGetAllByClinicIdWeb(clinicId, offset, max);
    }
  },

  // WEB
  postWeb(params: string) {
    return api()
      .post('stockDistributor', params)
      .then((resp) => {
        if (!isMobile.value) {
          stockDistributor.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          stockDistributorDexie
            .put(payload)
            .then(() => upsertStockDistributorCache(payload))
            .catch((error) => console.log(error));
        }
        return resp.data;
      });
  },

  async getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDistributor?offset=' + offset + '&max=100')
        .then((resp) => {
          if (resp.data.length > 0) {
            if (!isMobile.value) {
              stockDistributor.save(resp.data);
            }
            if (isMobile.value) {
              stockDistributorDexie
                .bulkPut(resp.data.map((entry: any) => clone(entry)))
                .then(() => upsertStockDistributorCache(resp.data))
                .catch((error) => console.log(error));
            }
            offset = offset + 100;
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        });
    }
  },

  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stockDistributor/' + id, params)
      .then((resp) => {
        if (!isMobile.value) {
          stockDistributor.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          stockDistributorDexie
            .put(payload)
            .then(() => upsertStockDistributorCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },

  deleteWeb(id: any) {
    return api()
      .delete('stockDistributor/' + id)
      .then(() => {
        if (!isMobile.value) {
          stockDistributor.destroy(id);
        }
        if (isMobile.value) {
          stockDistributorDexie
            .delete(id)
            .then(() => removeStockDistributorFromCache(id))
            .catch((error) => console.log(error));
        }
      });
  },
  async apiFetchByIdWeb(id: string) {
    const resp = await api().get('/stockDistributor/' + id);
    const payload = clone(resp.data);
    if (isMobile.value) {
      await stockDistributorDexie.put(payload);
      upsertStockDistributorCache(payload);
    } else {
      stockDistributor.save(payload);
    }
    if (Array.isArray(payload) && payload.length > 0) {
      setTimeout(() => this.get(0), 2);
    }
    return payload;
  },

  async apiGetAllByClinicIdWeb(clinicId: string, offset: number, max: number) {
    const resp = await api().get(
      '/stockDistributor/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
    const data = Array.isArray(resp.data) ? resp.data : [];
    if (data.length > 0) {
      if (isMobile.value) {
        await stockDistributorDexie.bulkPut(
          data.map((entry: any) => clone(entry))
        );
        upsertStockDistributorCache(data);
      } else {
        stockDistributor.save(data);
      }
    }
    return data;
  },

  //Mobile

  //Mobile
  async addMobile(params: any) {
    const payload = clone(toPlainObject(params));
    return stockDistributorDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockDistributorCache(payload);
          return payload;
        }
        stockDistributor.save(payload);
        return payload;
      });
  },

  async getFromBackEnd(offset: number) {
    if (offset < 0) {
      return;
    }
    try {
      const resp = await api().get(
        'stockDistributor?offset=' + offset + '&max=100'
      );
      const data = Array.isArray(resp.data) ? resp.data : [];
      if (data.length > 0) {
        await this.addBulkMobile(data);
        console.log('Data synced from backend: stockDistributor');
        return this.getFromBackEnd(offset + 100);
      }
    } catch (error) {
      console.error('Error syncing data from backend:', error);
      console.log(error);
    }
  },
  //mobile
  addBulkMobile(params: any) {
    const payload = Array.isArray(params)
      ? params.map((entry: any) => clone(entry))
      : [clone(params)];
    return stockDistributorDexie
      .bulkPut(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockDistributorCache(payload);
        } else {
          stockDistributor.save(payload);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async getMobile() {
    try {
      const rows = await stockDistributorDexie.toArray();
      if (isMobile.value) {
        setStockDistributorMobileCache(rows);
        return getStockDistributorMobileCache();
      }
      stockDistributor.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async deleteMobile(id: any) {
    try {
      await stockDistributorDexie.delete(id);
      if (isMobile.value) {
        removeStockDistributorFromCache(id);
      } else {
        stockDistributor.destroy(id);
      }
      // alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async putMobile(params: any) {
    const payload = clone(toPlainObject(params));
    return stockDistributorDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertStockDistributorCache(payload);
          return payload;
        }
        stockDistributor.save(payload);
        return payload;
      });
  },

  apiFetchByIdMobile(id: any) {
    return stockDistributorDexie
      .where('id')
      .equalsIgnoreCase(id)
      .then((rows: any) => {
        if (isMobile.value) {
          upsertStockDistributorCache(rows);
          return rows.map((entry: any) => clone(entry));
        }
        stockDistributor.save(rows);
        return rows;
      });
  },

  async apiGetAllByClinicIdMobile(clinicId: any) {
    const collection = stockDistributorDexie.filter(
      (stockDistributor: StockDistributor) =>
        clinicId === stockDistributor?.clinic?.id
    );
    return await collection.toArray().then((rows: any) => {
      if (isMobile.value) {
        upsertStockDistributorCache(rows);
        return rows.map((entry: any) => clone(entry));
      }
      stockDistributor.save(rows);
      return rows;
    });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return stockDistributor.getModel().$newInstance();
  },
  // ****** PNIA
  getStockDistributorById(id: string) {
    if (isMobile.value) {
      return getStockDistributorMobileCache().find((entry) => entry.id === id) ?? null;
    }
    return stockDistributor
      .query()
      .with('drugDistributors')
      .with('clinic')
      .where('id', id)
      .first();
  },

  getStockDistributorServices(clinicId: any) {
    if (isMobile.value) {
      return getStockDistributorMobileCache()
        .filter(
          (entry) =>
            entry.clinic_id === clinicId || entry.clinic?.id === clinicId
        )
        .sort((a, b) =>
          String(b.creationDate || '').localeCompare(
            String(a.creationDate || '')
          )
        );
    }
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .where('clinic_id', clinicId)
      .orderBy('creationDate', 'desc')
      .get();
  },

  getStockDistributorConfirmation(clinicId: any) {
    if (isMobile.value) {
      return getStockDistributorMobileCache()
        .filter((entry) =>
          (entry.drugDistributors || []).some((dist: any) => {
            return (
              dist.clinic_id === clinicId ||
              dist.clinic?.id === clinicId
            );
          })
        )
        .sort((a, b) =>
          String(b.creationDate || '').localeCompare(
            String(a.creationDate || '')
          )
        );
    }
    return stockDistributor
      .query()
      .with('clinic')
      .with('drugDistributors')
      .whereHas('drugDistributors', (query) => {
        query.where('clinic_id', clinicId);
      })
      .orderBy('creationDate', 'desc')
      .get();
  },
  deleteAllFromStorage() {
    if (isMobile.value) {
      stockDistributorMobileCache = [];
      return stockDistributorDexie.clear().catch((error: any) => {
        console.log(error);
        throw error;
      });
    }
    stockDistributor.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStockDistributorMobileCache();
  },
};
