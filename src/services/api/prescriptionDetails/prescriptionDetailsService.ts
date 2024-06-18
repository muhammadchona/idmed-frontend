import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const prescriptionDetails = useRepo(PrescriptionDetails);
const prescriptionDetailsDexie = PrescriptionDetails.entity;

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
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('prescriptionDetails', params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescriptionDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          prescriptionDetails.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('prescriptionDetails/' + uuid, params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescriptionDetails/' + uuid)
      .then(() => {
        prescriptionDetails.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[prescriptionDetailsDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescriptionDetails.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[prescriptionDetailsDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescriptionDetails.save(JSON.parse(JSON.stringify(params)));
      });
  },

  getMobile() {
    return db[prescriptionDetailsDexie]
      .toArray()
      .then((rows: any) => {
        prescriptionDetails.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[prescriptionDetailsDexie]
      .delete(paramsId)
      .then(() => {
        prescriptionDetails.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api()
      .get('/prescriptionDetail/prescription/' + prescriptionId)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },

  async apiGetAll() {
    return this.get(0);
  },

  async apiFetchById(id: string) {
    return await api().get(`/prescriptionDetail/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return prescriptionDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescriptionDetails.all();
  },
  deleteAllFromStorage() {
    prescriptionDetails.flush();
  },
  getPrescriptionDetailByPrescriptionID(prescriptionID: string) {
    return prescriptionDetails.withAll().where((prescriptionDetails) => {
      return prescriptionDetails.prescription_id === prescriptionID;
    });
  },

  getPrescriptionDetailByID(Id: string) {
    return prescriptionDetails
      .withAll()
      .with('therapeuticRegimen', (query) => {
        query.withAllRecursive(2);
      })
      .where((prescriptionDetails) => {
        return prescriptionDetails.id === Id;
      })
      .first();
  },

  getLastByPrescriprionId(prescriptionId: string) {
    return prescriptionDetails
      .withAllRecursive(1)
      .where('prescription_id', prescriptionId)
      .first();
  },
};
