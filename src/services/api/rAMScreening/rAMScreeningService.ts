import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RAMScreening from 'src/stores/models/screening/RAMScreening';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const rAMScreening = useRepo(RAMScreening);
const rAMScreeningDexie = RAMScreening.entity;

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
      .post('rAMScreening', params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('rAMScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          rAMScreening.save(resp.data);
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
      .patch('rAMScreening/' + uuid, params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('rAMScreening/' + uuid)
      .then(() => {
        rAMScreening.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[rAMScreeningDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        rAMScreening.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[rAMScreeningDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        rAMScreening.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return db[rAMScreeningDexie]
      .toArray()
      .then((rows: any) => {
        rAMScreening.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[rAMScreeningDexie]
      .delete(paramsId)
      .then(() => {
        rAMScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[rAMScreeningDexie]
      .bulkAdd(params)
      .then(() => {
        rAMScreening.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/RAMScreening?offset=' + offset + '&max=' + max);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return rAMScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return rAMScreening.all();
  },
  deleteAllFromStorage() {
    rAMScreening.flush();
  },
};
