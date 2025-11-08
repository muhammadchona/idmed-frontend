import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const startStopReason = useRepo(StartStopReason);
const startStopReasonDexie = db[StartStopReason.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let startStopReasonMobileCache: any[] = [];

const setStartStopReasonMobileCache = (rows: any[]) => {
  startStopReasonMobileCache = rows.map((row) => clone(row));
};

const getStartStopReasonMobileCache = () =>
  startStopReasonMobileCache.map((row) => clone(row));

const refreshStartStopReasonMobileCache = async () => {
  const rows = await startStopReasonDexie.toArray();
  setStartStopReasonMobileCache(rows);
  return getStartStopReasonMobileCache();
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
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
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
      .post('startStopReason', params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('startStopReason?offset=' + offset + '&max=100')
        .then((resp) => {
          startStopReason.save(resp.data);
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
      .patch('startStopReason/' + uuid, params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('startStopReason/' + uuid)
      .then(() => {
        startStopReason.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return startStopReasonDexie
      .put(payload)
      .then(async () => {
        await refreshStartStopReasonMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return startStopReasonDexie
      .put(payload)
      .then(async () => {
        await refreshStartStopReasonMobileCache();
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
    return refreshStartStopReasonMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return startStopReasonDexie
      .delete(paramsId)
      .then(async () => {
        startStopReasonMobileCache = startStopReasonMobileCache.filter(
          (item) => item.id !== paramsId
        );
        alertSucess('O Registo foi removido com sucesso');
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
    return startStopReasonDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshStartStopReasonMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/startStopReason/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return startStopReason.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getStartStopReasonMobileCache();
    }
    return startStopReason.all();
  },
  getAllStartReasons() {
    if (isMobile.value && !isOnline.value) {
      return getStartStopReasonMobileCache()
        .filter((entry) => entry.isStartReason === true)
        .sort((a, b) =>
          String(a.reason || '').localeCompare(String(b.reason || ''))
        );
    }
    return startStopReason
      .where('isStartReason', true)
      .orderBy('reason', 'asc')
      .get();
  },
  getAllStopReasons() {
    if (isMobile.value && !isOnline.value) {
      return getStartStopReasonMobileCache()
        .filter((entry) => entry.isStartReason === false)
        .sort((a, b) =>
          String(a.reason || '').localeCompare(String(b.reason || ''))
        );
    }
    return startStopReason
      .where('isStartReason', false)
      .orderBy('reason', 'asc')
      .get();
  },
  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getStartStopReasonMobileCache().find((entry) => entry.id === id) ?? null
      );
    }
    return startStopReason
      .query()
      .where((startStopReason) => {
        return startStopReason.id === id;
      })
      .get();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await startStopReasonDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },

  getStartStopReasonByCode(code: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getStartStopReasonMobileCache().find((entry) => entry.code === code) ??
        null
      );
    }
    return startStopReason.query().where('code', code).first();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshStartStopReasonMobileCache();
  },
};
