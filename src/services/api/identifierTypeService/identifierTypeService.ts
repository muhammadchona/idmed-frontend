import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const identifierType = useRepo(IdentifierType);
const identifierTypeDexie = db[IdentifierType.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let identifierTypeMobileCache: any[] = [];

const setIdentifierTypeMobileCache = (rows: any[]) => {
  identifierTypeMobileCache = rows.map((row) => clone(row));
};

const getIdentifierTypeMobileCache = () =>
  identifierTypeMobileCache.map((row) => clone(row));

const refreshIdentifierTypeMobileCache = async () => {
  const rows = await identifierTypeDexie.toArray();
  setIdentifierTypeMobileCache(rows);
  return getIdentifierTypeMobileCache();
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
      .post('identifierType', params)
      .then((resp) => {
        identifierType.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          identifierType.save(resp.data);
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
      .patch('identifierType/' + uuid, params)
      .then((resp) => {
        identifierType.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('identifierType/' + uuid)
      .then(() => {
        identifierType.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return identifierTypeDexie
      .put(payload)
      .then(async () => {
        await refreshIdentifierTypeMobileCache();
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
    return identifierTypeDexie
      .put(payload)
      .then(async () => {
        await refreshIdentifierTypeMobileCache();
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
    return refreshIdentifierTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return identifierTypeDexie
      .delete(paramsId)
      .then(async () => {
        identifierTypeMobileCache = identifierTypeMobileCache.filter(
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
    return identifierTypeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshIdentifierTypeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return identifierType.getModel().$newInstance();
  },

  getAllIdentifierTypes() {
    if (isMobile.value && !isOnline.value) {
      return getIdentifierTypeMobileCache();
    }
    return identifierType.query().withAll().get();
  },
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('identifierType/identifierTypeFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            closeLoading();
          }
        });
    }
  },
  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await identifierTypeDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshIdentifierTypeMobileCache();
  },
};
