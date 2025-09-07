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
    return pregnancyScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        pregnancyScreening.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return pregnancyScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        pregnancyScreening.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return pregnancyScreeningDexie
      .toArray()
      .then((rows: any) => {
        pregnancyScreening.save(rows);
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
        pregnancyScreening.destroy(paramsId);
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
    const pregnancyScreenings = await pregnancyScreeningDexie
      .where('patient_visit_id')
      .equalsIgnoreCase(id)
      .toArray();
    pregnancyScreening.save(pregnancyScreenings);
    return pregnancyScreenings;
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
