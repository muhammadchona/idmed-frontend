import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const interoperabilityType = useRepo(InteroperabilityType);
const interoperabilityTypeDexie = db[InteroperabilityType.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let interoperabilityTypeMobileCache: any[] = [];

const setInteroperabilityTypeMobileCache = (rows: any[]) => {
  interoperabilityTypeMobileCache = rows.map((row) => clone(row));
};

const getInteroperabilityTypeMobileCache = () =>
  interoperabilityTypeMobileCache.map((row) => clone(row));

const refreshInteroperabilityTypeMobileCache = async () => {
  const rows = await interoperabilityTypeDexie.toArray();
  setInteroperabilityTypeMobileCache(rows);
  return getInteroperabilityTypeMobileCache();
};

export default {
  async post(params: string) {
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
      const resp = await api().post('interoperabilityType', params);
      interoperabilityType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
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
      const resp = await api().patch('interoperabilityType/' + uuid, params);
      interoperabilityType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('interoperabilityType/' + uuid);
      interoperabilityType.destroy(uuid);
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
    return interoperabilityTypeDexie
      .put(payload)
      .then(async () => {
        await refreshInteroperabilityTypeMobileCache();
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
    return interoperabilityTypeDexie
      .put(payload)
      .then(async () => {
        await refreshInteroperabilityTypeMobileCache();
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
    return refreshInteroperabilityTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return interoperabilityTypeDexie
      .delete(paramsId)
      .then(async () => {
        interoperabilityTypeMobileCache = interoperabilityTypeMobileCache.filter(
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
    return interoperabilityTypeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshInteroperabilityTypeMobileCache();
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
    return await api().get(`/interoperabilityType/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityType.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getInteroperabilityTypeMobileCache();
    }
    return interoperabilityType.all();
  },
  getAll() {
    if (isMobile.value && !isOnline.value) {
      return getInteroperabilityTypeMobileCache();
    }
    return interoperabilityType.query().withAll().get();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshInteroperabilityTypeMobileCache();
  },
};
