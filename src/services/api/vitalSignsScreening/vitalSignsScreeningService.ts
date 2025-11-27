import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import VitalSignsScreening from 'src/stores/models/screening/VitalSignsScreening';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const vitalSignsScreening = useRepo(VitalSignsScreening);
const vitalSignsScreeningDexie = db[VitalSignsScreening.entity];

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

let vitalSignsScreeningMobileCache: any[] = [];

const setVitalSignsScreeningMobileCache = (rows: any[]) => {
  vitalSignsScreeningMobileCache = rows.map((row) => clone(row));
};

const getVitalSignsScreeningMobileCache = () =>
  vitalSignsScreeningMobileCache.map((row) => clone(row));

const upsertVitalSignsScreeningCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = vitalSignsScreeningMobileCache.findIndex(
      (detail) => detail.id === payload.id
    );
    if (index >= 0) {
      vitalSignsScreeningMobileCache.splice(index, 1, payload);
    } else {
      vitalSignsScreeningMobileCache.push(payload);
    }
  });
};

const removeVitalSignsScreeningFromCache = (id: string) => {
  vitalSignsScreeningMobileCache = vitalSignsScreeningMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshVitalSignsScreeningMobileCache = async () => {
  const rows = await vitalSignsScreeningDexie.toArray();
  setVitalSignsScreeningMobileCache(rows);
  return getVitalSignsScreeningMobileCache();
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
      .post('vitalSignsScreening', params)
      .then((resp) => {
        vitalSignsScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('vitalSignsScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          vitalSignsScreening.save(resp.data);
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
      .patch('vitalSignsScreening/' + uuid, params)
      .then((resp) => {
        vitalSignsScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('vitalSignsScreening/' + uuid)
      .then(() => {
        vitalSignsScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return vitalSignsScreeningDexie
      .put(payload)
      .then(() => {
        upsertVitalSignsScreeningCache(payload);
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return vitalSignsScreeningDexie.put(payload).then(() => {
      upsertVitalSignsScreeningCache(payload);
      return payload;
    });
  },
  getMobile() {
    return vitalSignsScreeningDexie
      .toArray()
      .then((rows: any) => {
        setVitalSignsScreeningMobileCache(rows);
        return getVitalSignsScreeningMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return vitalSignsScreeningDexie
      .delete(paramsId)
      .then(() => {
        removeVitalSignsScreeningFromCache(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const vitalSignsScreeningFromPinia = this.getAllFromStorageForDexie();

    return vitalSignsScreeningDexie
      .bulkAdd(vitalSignsScreeningFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getVitalSignsScreeningByVisitIdMobile(id: string) {
    const collection = vitalSignsScreeningDexie
      .orderBy('id')
      .reverse()
      .filter(
        (vitalSignsScreening: VitalSignsScreening) =>
          id === vitalSignsScreening?.visit?.id
      );
    const resp = await collection.toArray();
    vitalSignsScreening.save(resp);
    return resp;
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/vitalSignsScreening?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return vitalSignsScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return vitalSignsScreening.all();
  },
  getAllFromStorageForDexie() {
    return vitalSignsScreening.makeHidden(['visit']).all();
  },
  deleteAllFromStorage() {
    vitalSignsScreening.flush();
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await vitalSignsScreeningDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  async getAllByPatientVisitIDsFromDexie(ids: string[]) {
    const collection = vitalSignsScreeningDexie.filter(
      (vitalSignsScreening: VitalSignsScreening) =>
        ids.includes(vitalSignsScreening?.patientVisit?.id)
    );
    return await collection.toArray().then((rows: any) => {
      vitalSignsScreening.save(rows);
      return rows;
    });
  },
  deleteAllFromDexie() {
    vitalSignsScreeningDexie.clear();
  },
};
