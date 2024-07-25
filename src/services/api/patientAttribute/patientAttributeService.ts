import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientAttribute from 'src/stores/models/patientAttribute/PatientAttribute';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const patientAttribute = useRepo(PatientAttribute);
const patientAttributeDexie = PatientAttribute.entity;

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
      .post('patientAttribute', params)
      .then((resp) => {
        patientAttribute.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          patientAttribute.save(resp.data);
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
      .patch('patientAttribute/' + uuid, params)
      .then((resp) => {
        patientAttribute.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientAttribute/' + uuid)
      .then(() => {
        patientAttribute.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[patientAttributeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientAttribute.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[patientAttributeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientAttribute.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return db[patientAttributeDexie]
      .toArray()
      .then((rows: any) => {
        patientAttribute.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[patientAttributeDexie]
      .delete(paramsId)
      .then(() => {
        patientAttribute.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[patientAttributeDexie]
      .bulkAdd(params)
      .then(() => {
        patientAttribute.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientAttribute.all();
  },
};
