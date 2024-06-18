import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReference from 'src/stores/models/transreference/PatientTransReference';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const patientTransReference = useRepo(PatientTransReference);
const patientTransReferenceDexie = PatientTransReference.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('patientTransReference', params)
      .then((resp) => {
        patientTransReference.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReference?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReference.save(resp.data);
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
      .patch('patientTransReference/' + uuid, params)
      .then((resp) => {
        patientTransReference.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientTransReference/' + uuid)
      .then(() => {
        patientTransReference.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[patientTransReferenceDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientTransReference.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[patientTransReferenceDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientTransReference.save(JSON.parse(JSON.stringify(params)));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[patientTransReferenceDexie]
      .toArray()
      .then((rows: any) => {
        patientTransReference.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[patientTransReferenceDexie]
      .delete(paramsId)
      .then(() => {
        patientTransReference.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReference?offset=' + offset + '&max=' + max
    );
  },

  apiSendLostFolowUp(loadedPatient: any) {
    return api().post('/patientTransReference/folowup', loadedPatient);
  },

  async apiSave(transReference: any) {
    return await api().post('/patientTransReference', transReference);
  },

  async apiRemove(transReference: any) {
    return await api().delete(`/patientTransReference/${transReference.id}`);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientTransReference/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReference.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReference.all();
  },
};
