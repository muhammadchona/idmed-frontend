import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';

const adherenceScreening = useRepo(AdherenceScreening);
const adherenceScreeningDexi = AdherenceScreening.entity;

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
      this.deleteMobile(uuid);
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
  addMobile(params: string) {
    showloading();
    return db[adherenceScreeningDexi]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        adherenceScreening.save(params);
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
    return db[adherenceScreeningDexi]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        adherenceScreening.save(params);
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
    return db[adherenceScreeningDexi]
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
    return db[adherenceScreeningDexi]
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
  addBulkMobile(params: string) {
    return db[adherenceScreeningDexi]
      .bulkPut(params)
      .then(() => {
        adherenceScreening.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return adherenceScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return adherenceScreening.all();
  },
  deleteAllFromStorage() {
    adherenceScreening.flush();
  },
};
