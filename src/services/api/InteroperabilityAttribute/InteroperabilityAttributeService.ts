import db from '../../../stores/dexie';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const interoperabilityAttribute = useRepo(InteroperabilityAttribute);
const interoperabilityAttributeDexie = db[InteroperabilityAttribute.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let interoperabilityAttributeMobileCache: any[] = [];

const setInteroperabilityAttributeMobileCache = (rows: any[]) => {
  interoperabilityAttributeMobileCache = rows.map((row) => clone(row));
};

const getInteroperabilityAttributeMobileCache = () =>
  interoperabilityAttributeMobileCache.map((row) => clone(row));

const refreshInteroperabilityAttributeMobileCache = async () => {
  const rows = await interoperabilityAttributeDexie.toArray();
  setInteroperabilityAttributeMobileCache(rows);
  return getInteroperabilityAttributeMobileCache();
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
      const resp = await api().post('interoperabilityAttribute', params);
      interoperabilityAttribute.save(resp.data);
    } catch (error: any) {
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityAttribute.save(resp.data);
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
      const resp = await api().patch(
        'interoperabilityAttribute/' + uuid,
        params
      );
      interoperabilityAttribute.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('interoperabilityAttribute/' + uuid);
      interoperabilityAttribute.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return interoperabilityAttributeDexie
      .put(payload)
      .then(async () => {
        await refreshInteroperabilityAttributeMobileCache();
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
    return interoperabilityAttributeDexie
      .put(payload)
      .then(async () => {
        await refreshInteroperabilityAttributeMobileCache();
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
    return refreshInteroperabilityAttributeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return interoperabilityAttributeDexie
      .delete(paramsId)
      .then(async () => {
        interoperabilityAttributeMobileCache =
          interoperabilityAttributeMobileCache.filter(
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
    return interoperabilityAttributeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshInteroperabilityAttributeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/interoperabilityAttribute?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getInteroperabilityAttributeMobileCache();
    }
    return interoperabilityAttribute.all();
  },
  saveLocalStorage(params: any) {
    return interoperabilityAttribute.save(params);
  },
  async deleteAllFromHealthSystem(healthInformationSysytemId: string) {
    if (isMobile.value && !isOnline.value) {
      const entries = getInteroperabilityAttributeMobileCache().filter(
        (entry) => entry.healthInformationSystem_id === healthInformationSysytemId
      );
      await Promise.all(
        entries.map((entry) =>
          interoperabilityAttributeDexie.delete(entry.id).catch((error: any) => {
            console.log(error);
          })
        )
      );
      interoperabilityAttributeMobileCache = interoperabilityAttributeMobileCache.filter(
        (entry) => entry.healthInformationSystem_id !== healthInformationSysytemId
      );
    } else {
      const attributes = interoperabilityAttribute
        .where('healthInformationSystem_id', healthInformationSysytemId)
        .get();
      attributes.forEach((attr) => {
        interoperabilityAttribute.destroy(attr.id);
      });
    }
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshInteroperabilityAttributeMobileCache();
  },
};
