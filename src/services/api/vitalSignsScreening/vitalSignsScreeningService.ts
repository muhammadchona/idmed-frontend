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
    return vitalSignsScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        vitalSignsScreening.save(JSON.parse(JSON.stringify(params)));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return vitalSignsScreeningDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        vitalSignsScreening.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return vitalSignsScreeningDexie
      .toArray()
      .then((rows: any) => {
        vitalSignsScreening.save(rows);
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
        vitalSignsScreening.destroy(paramsId);
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
    const vitalSignsScreenings = await vitalSignsScreeningDexie
      .where('patient_visit_id')
      .equalsIgnoreCase(id)
      .toArray();
    vitalSignsScreening.save(vitalSignsScreenings);
    return vitalSignsScreenings;
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
