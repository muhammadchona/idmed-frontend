import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const spetialPrescriptionMotive = useRepo(SpetialPrescriptionMotive);
const spetialPrescriptionMotiveDexie = db[SpetialPrescriptionMotive.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let spetialPrescriptionMotiveMobileCache: any[] = [];

const setSpetialPrescriptionMotiveMobileCache = (rows: any[]) => {
  spetialPrescriptionMotiveMobileCache = rows.map((row) => clone(row));
};

const getSpetialPrescriptionMotiveMobileCache = () =>
  spetialPrescriptionMotiveMobileCache.map((row) => clone(row));

const refreshSpetialPrescriptionMotiveMobileCache = async () => {
  const rows = await spetialPrescriptionMotiveDexie.toArray();
  setSpetialPrescriptionMotiveMobileCache(rows);
  return getSpetialPrescriptionMotiveMobileCache();
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
      return this.putMobile(params);
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
      .post('spetialPrescriptionMotive', params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&max=100')
        .then((resp) => {
          spetialPrescriptionMotive.save(resp.data);
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
      .patch('spetialPrescriptionMotive/' + uuid, params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('spetialPrescriptionMotive/' + uuid)
      .then(() => {
        spetialPrescriptionMotive.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return spetialPrescriptionMotiveDexie
      .put(payload)
      .then(async () => {
        await refreshSpetialPrescriptionMotiveMobileCache();
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
    return spetialPrescriptionMotiveDexie
      .put(payload)
      .then(async () => {
        await refreshSpetialPrescriptionMotiveMobileCache();
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
    return refreshSpetialPrescriptionMotiveMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return spetialPrescriptionMotiveDexie
      .delete(paramsId)
      .then(async () => {
        spetialPrescriptionMotiveMobileCache =
          spetialPrescriptionMotiveMobileCache.filter((item) => item.id !== paramsId);
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
    return spetialPrescriptionMotiveDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshSpetialPrescriptionMotiveMobileCache();
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
    return await api().get(`/spetialPrescriptionMotive/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return spetialPrescriptionMotive.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getSpetialPrescriptionMotiveMobileCache();
    }
    return spetialPrescriptionMotive.all();
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await spetialPrescriptionMotiveDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshSpetialPrescriptionMotiveMobileCache();
  },
};
