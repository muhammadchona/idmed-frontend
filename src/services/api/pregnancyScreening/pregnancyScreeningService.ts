import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PregnancyScreening from 'src/stores/models/screening/PregnancyScreening';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const pregnancyScreening = useRepo(PregnancyScreening);
const pregnancyScreeningDexie = db[PregnancyScreening.entity];

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

let pregnancyScreeningMobileCache: any[] = [];

const setPregnancyScreeningMobileCache = (rows: any[]) => {
  pregnancyScreeningMobileCache = rows.map((row) => clone(row));
};

const getPregnancyScreeningMobileCache = () =>
  pregnancyScreeningMobileCache.map((row) => clone(row));

const upsertPregnancyScreeningCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = pregnancyScreeningMobileCache.findIndex(
      (detail) => detail.id === payload.id
    );
    if (index >= 0) {
      pregnancyScreeningMobileCache.splice(index, 1, payload);
    } else {
      pregnancyScreeningMobileCache.push(payload);
    }
  });
};

const removePregnancyScreeningFromCache = (id: string) => {
  pregnancyScreeningMobileCache = pregnancyScreeningMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshPregnancyScreeningMobileCache = async () => {
  const rows = await pregnancyScreeningDexie.toArray();
  setPregnancyScreeningMobileCache(rows);
  return getPregnancyScreeningMobileCache();
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
      .post('pregnancyScreening', params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pregnancyScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          pregnancyScreening.save(resp.data);
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
      .patch('pregnancyScreening/' + uuid, params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pregnancyScreening/' + uuid)
      .then(() => {
        pregnancyScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return pregnancyScreeningDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertPregnancyScreeningCache(payload);
          return payload;
        }
        pregnancyScreening.save(payload);
        return payload;
      });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return pregnancyScreeningDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertPregnancyScreeningCache(payload);
          return payload;
        }
        pregnancyScreening.save(payload);
        return payload;
      });
  },
  getMobile() {
    return pregnancyScreeningDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value) {
          setPregnancyScreeningMobileCache(rows);
          return getPregnancyScreeningMobileCache();
        }
        pregnancyScreening.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return pregnancyScreeningDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value) {
          removePregnancyScreeningFromCache(paramsId);
        } else {
          pregnancyScreening.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const pregnancyScreeningFromPinia = this.getAllFromStorageForDexie();
    return pregnancyScreeningDexie
      .bulkPut(pregnancyScreeningFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getPregnancyScreeningsByVisitIdMobile(id: string) {
    const collection = pregnancyScreeningDexie
      .orderBy('id')
      .reverse()
      .filter(
        (pregnancyScreening: PregnancyScreening) =>
          id === pregnancyScreening?.visit?.id
      );
    const resp = await collection.toArray();

    pregnancyScreening.save(resp);
    return resp;
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/pregnancyScreening?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllByPatientVisitId(
    patientVisitId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/pregnancyScreening/patientVisit/' +
        patientVisitId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return pregnancyScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pregnancyScreening.all();
  },
  getAllFromStorageForDexie() {
    return pregnancyScreening.makeHidden(['visit']).all();
  },
  deleteAllFromStorage() {
    pregnancyScreening.flush();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await pregnancyScreeningDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },

  async getAllByPatientVisitIDsFromDexie(ids: string[]) {
    const collection = pregnancyScreeningDexie.filter(
      (screening: PregnancyScreening) =>
        ids.includes(screening?.patientVisit?.id)
    );
    return await collection.toArray();
  },
  deleteAllFromDexie() {
    pregnancyScreeningDexie.clear();
  },
};
