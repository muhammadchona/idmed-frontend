import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import TBScreening from 'src/stores/models/screening/TBScreening';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const tBScreening = useRepo(TBScreening);
const tBScreeningDexie = db[TBScreening.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

let tbScreeningMobileCache: any[] = [];

const upsertTbScreening = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = tbScreeningMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      tbScreeningMobileCache.splice(index, 1, payload);
    } else {
      tbScreeningMobileCache.push(payload);
    }
  });
};

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
      .post('tBScreening', params)
      .then((resp) => {
        tBScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('tBScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          tBScreening.save(resp.data);
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
      .patch('tBScreening/' + uuid, params)
      .then((resp) => {
        tBScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('tBScreening/' + uuid)
      .then(() => {
        tBScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return tBScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        upsertTbScreening(payload);
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return tBScreeningDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      tBScreening.save(JSON.parse(JSON.stringify(params)));
    });
  },
  getMobile() {
    return tBScreeningDexie
      .toArray()
      .then((rows: any) => {
        tBScreening.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return tBScreeningDexie
      .delete(paramsId)
      .then(() => {
        tBScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const tBScreeningFromPinia = this.getAllFromStorageForDexie();

    return tBScreeningDexie
      .bulkAdd(tBScreeningFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getTBScreeningsByVisitIdMobile(id: string) {
    const collection = tBScreeningDexie
      .orderBy('id')
      .reverse()
      .filter((tBScreening: TBScreening) => id === tBScreening?.visit?.id);
    const resp = await collection.toArray();

    tBScreening.save(resp);
    return resp;
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return tBScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return tBScreening.all();
  },
  getAllFromStorageForDexie() {
    return tBScreening.makeHidden(['visit']).all();
  },
  deleteAllFromStorage() {
    tBScreening.flush();
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await tBScreeningDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },

  async getAllByPatientVisitIDsFromDexie(ids: string[]) {
    const collection = tBScreeningDexie.filter((tBScreening: TBScreening) =>
      ids.includes(
        tBScreening?.patientVisit?.id || tBScreening?.patient_visit_id
      )
    );
    return await collection.toArray().then((rows: any) => {
      tBScreening.save(rows);
      return rows;
    });
  },

  deleteAllFromDexie() {
    tBScreeningDexie.clear();
  },
};
