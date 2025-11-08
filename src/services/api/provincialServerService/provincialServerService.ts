import { useRepo } from 'pinia-orm';
import ProvincialServer from 'src/stores/models/provincialServer/ProvincialServer';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const provincialServer = useRepo(ProvincialServer);
const provincialServerDexie = db[ProvincialServer.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let provincialServerMobileCache: any[] = [];

const setProvincialServerMobileCache = (rows: any[]) => {
  provincialServerMobileCache = rows.map((row) => clone(row));
};

const getProvincialServerMobileCache = () =>
  provincialServerMobileCache.map((row) => clone(row));

const refreshProvincialServerMobileCache = async () => {
  const rows = await provincialServerDexie.toArray();
  setProvincialServerMobileCache(rows);
  return getProvincialServerMobileCache();
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
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
      const resp = await api().post('provincialServer', params);
      provincialServer.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('provincialServer?offset=' + offset + '&max=100')
        .then((resp) => {
          provincialServer.save(resp.data);
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
      const resp = await api().patch('provincialServer/' + uuid, params);
      provincialServer.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('provincialServer/' + uuid);
      provincialServer.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return provincialServerDexie
      .put(payload)
      .then(async () => {
        await refreshProvincialServerMobileCache();
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
    return provincialServerDexie
      .put(payload)
      .then(async () => {
        await refreshProvincialServerMobileCache();
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
    return refreshProvincialServerMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return provincialServerDexie
      .delete(paramsId)
      .then(async () => {
        provincialServerMobileCache = provincialServerMobileCache.filter(
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
    return provincialServerDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshProvincialServerMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/provincialServer/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  // Pinia LocalBase
  async apiGetAllWithDistricts() {
    return provincialServer.query().with('districts').has('code').get();
  },

  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getProvincialServerMobileCache();
    }
    return provincialServer.all();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshProvincialServerMobileCache();
  },
};
