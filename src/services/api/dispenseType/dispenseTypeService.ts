import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { closeLoading, showloading } = useLoading();

const dispenseType = useRepo(DispenseType);
const dispenseTypeDexie = db[DispenseType.entity];
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let dispenseTypeMobileCache: any[] = [];

const setDispenseTypeMobileCache = (rows: any[]) => {
  dispenseTypeMobileCache = rows.map((row) => clone(row));
};

const getDispenseTypeMobileCache = () =>
  dispenseTypeMobileCache.map((row) => clone(row));

const refreshDispenseTypeMobileCache = async () => {
  const rows = await dispenseTypeDexie.toArray();
  setDispenseTypeMobileCache(rows);
  return getDispenseTypeMobileCache();
};

const filterByCodes = (codes: string[]) => {
  const codeSet = new Set(codes.map((code) => String(code).toUpperCase()));
  return getDispenseTypeMobileCache().filter((entry) =>
    codeSet.has(String(entry.code || '').toUpperCase())
  );
};

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('dispenseType', params);
    dispenseType.save(resp.data);
  },
  async get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      if (offset >= 0) {
        return await api()
          .get('dispenseType?offset=' + offset + '&max=100')
          .then((resp) => {
            dispenseType.save(resp.data);
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
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
        .get('dispenseType?offset=' + offset + '&max=100')
        .then((resp) => {
          dispenseType.save(resp.data);
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
  async patch(id: number, params: string) {
    const resp = await api().patch('dispenseType/' + id, params);
    dispenseType.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('dispenseType/' + id);
    dispenseType.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/dispenseType?offset=' + offset + '&max=' + max);
  },

  async apiFetchById(id: string) {
    return await api().get(`/dispenseType/${id}`);
  },
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return dispenseTypeDexie
      .put(payload)
      .then(async () => {
        await refreshDispenseTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshDispenseTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return dispenseTypeDexie
      .put(payload)
      .then(async () => {
        await refreshDispenseTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return dispenseTypeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshDispenseTypeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return dispenseType.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getDispenseTypeMobileCache();
    }
    return dispenseType.all();
  },
  getAllFromDuration(weeks: number) {
    let dispenseTypeList = [];
    if (isMobile.value && !isOnline.value) {
      if (weeks < 4) {
        dispenseTypeList = filterByCodes(['DN']);
      } else if (weeks === 4) {
        dispenseTypeList = filterByCodes(['DN', 'DM']);
      } else if (weeks === 8) {
        dispenseTypeList = filterByCodes(['DN', 'DM', 'DB']);
      } else if (weeks === 12) {
        dispenseTypeList = filterByCodes(['DM', 'DT', 'FRM']);
      } else if (weeks === 16) {
        dispenseTypeList = filterByCodes(['DM', 'DB', 'FRM']);
      } else if (weeks === 20) {
        dispenseTypeList = filterByCodes(['DM', 'FRM']);
      } else if (weeks === 24) {
        dispenseTypeList = filterByCodes(['DM', 'DB', 'DT', 'DS', 'FRM']);
      } else {
        dispenseTypeList = getDispenseTypeMobileCache();
      }
      return dispenseTypeList.sort((a, b) =>
        String(a.id || '').localeCompare(String(b.id || ''))
      );
    }
    if (weeks < 4) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 4) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN' || value === 'DM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 8) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN' || value === 'DM' || value === 'DB';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 12) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'DT' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 16) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'DB' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 20) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 24) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return (
            value === 'DM' ||
            value === 'DB' ||
            value === 'DT' ||
            value === 'DS' ||
            value === 'FRM'
          );
        })
        .orderBy('id', 'asc')
        .get();
    } else {
      dispenseTypeList = dispenseType.orderBy('id', 'asc').all();
    }

    return dispenseTypeList;
  },
  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getDispenseTypeMobileCache().find((entry) => entry.id === id) ?? null;
    }
    return dispenseType
      .query()
      .where((dispenseType) => {
        return dispenseType.id === id;
      })
      .first();
  },

  getAllForGroupDispense() {
    if (isMobile.value && !isOnline.value) {
      return filterByCodes(['DM', 'DT', 'DS', 'DA']).sort((a, b) =>
        String(a.id || '').localeCompare(String(b.id || ''))
      );
    }
    return dispenseType
      .where('code', (value: string) => {
        return (
          value === 'DM' || value === 'DT' || value === 'DS' || value === 'DA'
        );
      })
      .orderBy('id', 'asc')
      .get();
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await dispenseTypeDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshDispenseTypeMobileCache();
  },
};
