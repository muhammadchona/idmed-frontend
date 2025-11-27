import { patientVisitDetailsService } from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RAMScreening from 'src/stores/models/screening/RAMScreening';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const rAMScreening = useRepo(RAMScreening);
const rAMScreeningDexie = db[RAMScreening.entity];

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

let ramScreeningMobileCache: any[] = [];

const setRamScreeningMobileCache = (rows: any[]) => {
  ramScreeningMobileCache = rows.map((row) => clone(row));
};

const getRamScreeningMobileCache = () =>
  ramScreeningMobileCache.map((row) => clone(row));

const upsertRamScreeningCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = ramScreeningMobileCache.findIndex(
      (detail) => detail.id === payload.id
    );
    if (index >= 0) {
      ramScreeningMobileCache.splice(index, 1, payload);
    } else {
      ramScreeningMobileCache.push(payload);
    }
  });
};

const removeRamScreeningFromCache = (id: string) => {
  ramScreeningMobileCache = ramScreeningMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshRamScreeningMobileCache = async () => {
  const rows = await rAMScreeningDexie.toArray();
  setRamScreeningMobileCache(rows);
  return getRamScreeningMobileCache();
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
      .post('rAMScreening', params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('rAMScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          rAMScreening.save(resp.data);
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
      .patch('rAMScreening/' + uuid, params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('rAMScreening/' + uuid)
      .then(() => {
        rAMScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return rAMScreeningDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertRamScreeningCache(payload);
        return payload;
      }
      rAMScreening.save(payload);
      return payload;
    });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return rAMScreeningDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertRamScreeningCache(payload);
        return payload;
      }
      rAMScreening.save(payload);
      return payload;
    });
  },
  getMobile() {
    return rAMScreeningDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value && !isOnline.value) {
          setRamScreeningMobileCache(rows);
          return getRamScreeningMobileCache();
        }
        rAMScreening.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return rAMScreeningDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          removeRamScreeningFromCache(paramsId);
        } else {
          rAMScreening.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const rAMScreeningFromPinia = this.getAllFromStorageForDexie();
    return rAMScreeningDexie
      .bulkAdd(rAMScreeningFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getRAMScreeningByVisitIdMobile(id: string) {
    const collection = rAMScreeningDexie
      .orderBy('id')
      .reverse()
      .filter((rAMScreening: RAMScreening) => id === rAMScreening?.visit?.id);
    const resp = await collection.toArray();

    rAMScreening.save(resp);
    return resp;
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/RAMScreening?offset=' + offset + '&max=' + max);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return rAMScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return rAMScreening.all();
  },
  getAllFromStorageForDexie() {
    return rAMScreening.makeHidden(['visit']).all();
  },
  deleteAllFromStorage() {
    rAMScreening.flush();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await rAMScreeningDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },

  async getAllByPatientVisitIDsFromDexie(ids: string[]) {
    const collection = rAMScreeningDexie.filter((ramScreening: RAMScreening) =>
      ids.includes(ramScreening?.patientVisit?.id)
    );
    return await collection.toArray();
  },
  deleteAllFromDexie() {
    rAMScreeningDexie.clear();
  },
};
