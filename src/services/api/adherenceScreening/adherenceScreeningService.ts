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
  async addMobile(params: string) {
    try {
      const adherence = await adherenceScreeningDexie.add(
        JSON.parse(JSON.stringify(params))
      );
      adherenceScreening.save(JSON.parse(JSON.stringify(params)));
      return adherence;
    } catch (error) {
      console.log(error);
    }
  },
  putMobile(params: string) {
    showloading();
    return adherenceScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        adherenceScreening.save(JSON.parse(JSON.stringify(params)));
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  patchMobile(params: string) {
    showloading();
    return adherenceScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        adherenceScreening.save(JSON.parse(JSON.stringify(params)));
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    showloading();
    return adherenceScreeningDexie
      .toArray()
      .then((rows: any) => {
        adherenceScreening.save(rows);
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return adherenceScreeningDexie
      .delete(paramsId)
      .then(() => {
        adherenceScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
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
    try {
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
    } catch (error) {
      console.error(error);
    }
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
