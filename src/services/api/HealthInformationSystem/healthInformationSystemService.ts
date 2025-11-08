import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const healthInformationSystem = useRepo(HealthInformationSystem);
const healthInformationSystemDexie = db[HealthInformationSystem.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let healthInformationSystemMobileCache: any[] = [];

const setHealthInformationSystemMobileCache = (rows: any[]) => {
  healthInformationSystemMobileCache = rows.map((row) => clone(row));
};

const getHealthInformationSystemMobileCache = () =>
  healthInformationSystemMobileCache.map((row) => clone(row));

const refreshHealthInformationSystemMobileCache = async () => {
  const rows = await healthInformationSystemDexie.toArray();
  setHealthInformationSystemMobileCache(rows);
  return getHealthInformationSystemMobileCache();
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('healthInformationSystem', params)
      .then((resp) => {
        healthInformationSystem.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          healthInformationSystem.save(resp.data);
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
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('healthInformationSystem/' + uuid, params)
      .then((resp) => {
        healthInformationSystem.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('healthInformationSystem/' + uuid)
      .then(() => {
        healthInformationSystem.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return healthInformationSystemDexie
      .put(payload)
      .then(async () => {
        await refreshHealthInformationSystemMobileCache();
        return payload;
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return healthInformationSystemDexie
      .put(payload)
      .then(async () => {
        await refreshHealthInformationSystemMobileCache();
        return payload;
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshHealthInformationSystemMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return healthInformationSystemDexie
      .delete(paramsId)
      .then(async () => {
        healthInformationSystemMobileCache =
          healthInformationSystemMobileCache.filter((item) => item.id !== paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return healthInformationSystemDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshHealthInformationSystemMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async apiFetchById(id: string) {
    return await api().get(`/healthInformationSystem/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/healthInformationSystem?offset=' + offset + '&max=' + max
    );
  },

  async apiSave(his: any) {
    return await api().post('/healthInformationSystem', his);
  },

  async apiUpdate(his: any) {
    return await api().patch('/healthInformationSystem/' + his.id, his);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return healthInformationSystem.getModel().$newInstance();
  },
  localSave(healtSystem: any) {
    healthInformationSystem.save(healtSystem);
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getHealthInformationSystemMobileCache();
    }
    return healthInformationSystem.all();
  },
  getAllActive() {
    if (isMobile.value && !isOnline.value) {
      return getHealthInformationSystemMobileCache().filter(
        (entry) => entry.active
      );
    }
    return healthInformationSystem
      .with('interoperabilityAttributes')
      .where('active', true)
      .get();
  },

  getAllHis() {
    if (isMobile.value && !isOnline.value) {
      return getHealthInformationSystemMobileCache();
    }
    return healthInformationSystem.withAllRecursive(3).get();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshHealthInformationSystemMobileCache();
  },
};
