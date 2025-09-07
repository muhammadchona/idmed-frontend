import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import drugService from '../drugService/drugService';

const prescribedDrug = useRepo(PrescribedDrug);
const prescribedDrugDexie = db[PrescribedDrug.entity];

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
      .post('prescribedDrug', params)
      .then((resp) => {
        prescribedDrug.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescribedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          prescribedDrug.save(resp.data);
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
      .patch('prescribedDrug/' + uuid, params)
      .then((resp) => {
        prescribedDrug.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescribedDrug/' + uuid)
      .then(() => {
        prescribedDrug.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return prescribedDrugDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescribedDrug.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return prescribedDrugDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescribedDrug.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return prescribedDrugDexie
      .toArray()
      .then((rows: any) => {
        prescribedDrug.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return prescribedDrugDexie
      .delete(paramsId)
      .then(() => {
        prescribedDrug.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const prescribedDrugFromPinia = this.getAllFromStorageForDexie();

    return prescribedDrugDexie
      .bulkAdd(prescribedDrugFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getLastByPrescriprionIdFromDexie(prescriptionId: string) {
    const collection = prescribedDrugDexie.filter(
      (prescribedDrug: PrescribedDrug) =>
        prescribedDrug?.prescription.id === prescriptionId
    );
    return await collection.toArray().then((prescribedDrugs: any) => {
      prescribedDrug.save(prescribedDrugs);
      return prescribedDrugs;
    });
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api()
      .get('/prescribedDrug/prescription/' + prescriptionId)
      .then((resp) => {
        prescribedDrug.save(resp.data);
      });
  },

  async apiGetAll() {
    return this.get(0);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescribedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescribedDrug.all();
  },
  getAllFromStorageForDexie() {
    return prescribedDrug.makeHidden(['prescription', 'drug']).all();
  },
  deleteAllFromStorage() {
    prescribedDrug.flush();
  },
  getLastByPrescriprionId(prescriptionId: string) {
    return prescribedDrug.where('prescription_id', prescriptionId).first();
  },
  async getAllByPrescriprionIdListFromDexie(prescriptionIds: string[]) {
    const collection = prescribedDrugDexie.filter(
      (prescribedDrug: PrescribedDrug) =>
        prescriptionIds.includes(prescribedDrug?.prescription?.id)
    );
    const prescribedDrugs = await collection
      .toArray()
      .then((prescribedDrugs: any) => {
        prescribedDrug.save(prescribedDrugs);
        return prescribedDrugs;
      });

    const drugIds = prescribedDrugs.map((prescribedDrug: any) =>
      prescribedDrug?.drug?.id ? prescribedDrug.drug.id : ''
    );

    const [drugs] = await Promise.all([
      drugService.getAllByIDsFromDexie(drugIds),
    ]);

    prescribedDrugs.map((prescribedDrug: any) => {
      prescribedDrug.drug = drugs.find(
        (drug: any) => drug.id === prescribedDrug.drug.id
      );
    });
    return prescribedDrugs;
  },
  deleteAllFromDexie() {
    prescribedDrugDexie.clear();
  },
};
