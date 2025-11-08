import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const systemConfigs = useRepo(SystemConfigs);
const systemConfigsDexie = db[SystemConfigs.entity];

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

const resolveId = (value: any) => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    return value.id ?? value.key ?? value;
  }
  return value;
};

let systemConfigsMobileCache: any[] = [];

const setSystemConfigsMobileCache = (rows: any[]) => {
  systemConfigsMobileCache = rows.map((row) => clone(row));
};

const getSystemConfigsMobileCache = () =>
  systemConfigsMobileCache.map((row) => clone(row));

const refreshSystemConfigsMobileCache = async () => {
  const rows = await systemConfigsDexie.toArray();
  setSystemConfigsMobileCache(rows);
  return getSystemConfigsMobileCache();
};

const findConfigInCache = (predicate: (entry: any) => boolean) =>
  getSystemConfigsMobileCache().find(predicate) ?? null;

const matchesKey = (value: any, target: string) =>
  String(value || '').trim().toUpperCase() === target;

const findConfigByKeyInCache = (key: string) => {
  const normalizedKey = String(key || '').trim().toUpperCase();
  if (!normalizedKey) {
    return null;
  }
  const cached = findConfigInCache((entry) =>
    matchesKey(entry?.key, normalizedKey)
  );
  if (cached) {
    return cached;
  }
  const piniaEntry =
    systemConfigs
      .all()
      .find((entry) => matchesKey(entry?.key, normalizedKey)) ?? null;
  return piniaEntry ? clone(piniaEntry) : null;
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
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
  async postWeb(params: string) {
    try {
      const resp = await api().post('systemConfigs', params);
      systemConfigs.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          systemConfigs.save(resp.data);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('systemConfigs/' + uuid, params);
      systemConfigs.save(resp.data);
      alertSucess('Rotina actualizada com sucesso.');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('systemConfigs/' + uuid);
      systemConfigs.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return systemConfigsDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          systemConfigs.save(JSON.parse(params));
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return systemConfigsDexie
      .put(payload)
      .then(async () => {
        await refreshSystemConfigsMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return systemConfigsDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          systemConfigs.save(JSON.parse(params));
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return systemConfigsDexie
      .put(payload)
      .then(async () => {
        await refreshSystemConfigsMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return systemConfigsDexie
        .toArray()
        .then((rows: any) => {
          systemConfigs.save(rows);
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    return systemConfigsDexie
      .toArray()
      .then((rows: any) => {
        setSystemConfigsMobileCache(rows);
        return getSystemConfigsMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return systemConfigsDexie
        .delete(paramsId)
        .then(() => {
          systemConfigs.destroy(paramsId);
          alertSucess('O Registo foi removido com sucesso');
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    const key = resolveId(paramsId);
    return systemConfigsDexie
      .delete(key)
      .then(() => {
        systemConfigsMobileCache = systemConfigsMobileCache.filter((entry) => {
          const entryKey = resolveId(entry);
          return entryKey !== key;
        });
        alertSucess('O Registo foi removido com sucesso');
        return key;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    const payload = toPlainObject(params);
    return systemConfigsDexie
      .bulkPut(payload)
      .then(async () => {
        if (isMobile.value) {
          await refreshSystemConfigsMobileCache();
        } else {
          systemConfigs.save(payload);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiFetchById(id: any) {
    return await api().get(`/systemConfigs/${id}`);
  },
  async apiGetAll() {
    return await this.get(0);
  },
  async apiSave(systemConfigs: any) {
    return await this.post(systemConfigs);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return systemConfigs.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value) {
      return getSystemConfigsMobileCache().sort((a, b) =>
        String(a?.description || '').localeCompare(String(b?.description || ''))
      );
    }
    return systemConfigs.orderBy('description').get();
  },
  getAllFromStorageWithoutMigration() {
    if (isMobile.value) {
      return getSystemConfigsMobileCache()
        .filter(
          (entry) =>
            ![
              'INSTALATION_TYPE',
              'PARAMS_MIGRATION_ENGINE',
              'STOCK_MIGRATION_ENGINE',
              'PATIENT_MIGRATION_ENGINE',
            ].includes(entry.key)
        )
        .sort((a, b) =>
          String(a?.description || '').localeCompare(
            String(b?.description || '')
          )
        );
    }
    return systemConfigs
      .whereNotIn('key', [
        'INSTALATION_TYPE',
        'PARAMS_MIGRATION_ENGINE',
        'STOCK_MIGRATION_ENGINE',
        'PATIENT_MIGRATION_ENGINE',
      ])
      .orderBy('description')
      .get();
  },

  saveInStorage(systemConfigsObj: any) {
    if (isMobile.value) {
      const payload = toPlainObject(systemConfigsObj);
      const persist = Array.isArray(payload)
        ? systemConfigsDexie.bulkPut(payload)
        : systemConfigsDexie.put(payload);
      return persist
        .then(async () => {
          await refreshSystemConfigsMobileCache();
          return systemConfigsObj;
        })
        .catch((error: any) => {
          console.log(error);
          throw error;
        });
    }
    return systemConfigs.save(systemConfigsObj);
  },

  getActiveDataMigration() {
    if (isMobile.value) {
      return findConfigByKeyInCache('ACTIVATE_DATA_MIGRATION');
    }
    return systemConfigs
      .query()
      .where('key', 'ACTIVATE_DATA_MIGRATION')
      .first();
  },

  getInstallationType() {
    if (isMobile.value) {
      return findConfigByKeyInCache('INSTALATION_TYPE');
    }
    return systemConfigs.query().where('key', 'INSTALATION_TYPE').first();
  },

  getApiURL() {
    if (isMobile.value) {
      return findConfigByKeyInCache('API_URL');
    }
    return systemConfigs.query().where('key', 'API_URL').first();
  },
  deleteAllFromStorage() {
    if (isMobile.value) {
      return systemConfigsDexie
        .clear()
        .then(() => {
          systemConfigsMobileCache = [];
        })
        .catch((error: any) => {
          console.log(error);
          throw error;
        });
    }
    systemConfigs.flush();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshSystemConfigsMobileCache();
  },
};
