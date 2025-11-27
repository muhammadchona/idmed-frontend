import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';

const adherenceScreening = useRepo(AdherenceScreening);
const adherenceScreeningDexie = db[AdherenceScreening.entity];

const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();

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

let adherenceScreeningMobileCache: any[] = [];

const setAdherenceScreeningMobileCache = (rows: any[]) => {
  adherenceScreeningMobileCache = rows.map((row) => clone(row));
};

const getAdherenceScreeningMobileCache = () =>
  adherenceScreeningMobileCache.map((row) => clone(row));

const upsertAdherenceScreeningCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = adherenceScreeningMobileCache.findIndex(
      (detail) => detail.id === payload.id
    );
    if (index >= 0) {
      adherenceScreeningMobileCache.splice(index, 1, payload);
    } else {
      adherenceScreeningMobileCache.push(payload);
    }
  });
};

const removeAdherenceScreeningFromCache = (id: string) => {
  adherenceScreeningMobileCache = adherenceScreeningMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshAdherenceScreeningMobileCache = async () => {
  const rows = await adherenceScreeningDexie.toArray();
  setAdherenceScreeningMobileCache(rows);
  return getAdherenceScreeningMobileCache();
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
      return this.patchMobile(params);
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
      .post('adherenceScreening', params)
      .then((resp) => {
        adherenceScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('adherenceScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          adherenceScreening.save(resp.data);
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
      .patch('adherenceScreening/' + uuid, params)
      .then((resp) => {
        adherenceScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('adherenceScreening/' + uuid)
      .then(() => {
        adherenceScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    showloading();
    const payload = clone(toPlainObject(params));
    return adherenceScreeningDexie
      .put(payload)
      .then(() => {
        upsertAdherenceScreeningCache(payload);
        closeLoading();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  patchMobile(params: string) {
    showloading();
    const payload = clone(toPlainObject(params));
    return adherenceScreeningDexie
      .put(payload)
      .then(() => {
        upsertAdherenceScreeningCache(payload);
        closeLoading();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    showloading();
    return adherenceScreeningDexie
      .toArray()
      .then((rows: any) => {
        setAdherenceScreeningMobileCache(rows);
        closeLoading();
        return getAdherenceScreeningMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    return adherenceScreeningDexie
      .delete(paramsId)
      .then(() => {
        removeAdherenceScreeningFromCache(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile() {
    const adherenceScreeningFromPinia = this.getAllFromStorageForDexie();
    return adherenceScreeningDexie
      .bulkPut(adherenceScreeningFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getAdherenceScreeningByVisitIdMobile(id: string) {
    const collection = adherenceScreeningDexie
      .orderBy('id')
      .reverse()
      .filter(
        (adherenceScreening: AdherenceScreening) =>
          id === adherenceScreening?.visit?.id
      );
    const resp = await collection.toArray();

    adherenceScreening.save(resp);
    return resp;
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return adherenceScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return adherenceScreening.all();
  },
  getAllFromStorageForDexie() {
    return adherenceScreening.makeHidden(['visit']).all();
  },
  deleteAllFromStorage() {
    adherenceScreening.flush();
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await adherenceScreeningDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },

  async getAllByPatientVisitIDsFromDexie(ids: []) {
    return await adherenceScreeningDexie
      .where('patient_visit_id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  deleteAllFromDexie() {
    adherenceScreeningDexie.clear();
  },
};
