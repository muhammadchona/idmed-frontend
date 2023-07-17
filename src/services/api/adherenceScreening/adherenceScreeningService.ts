import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const adherenceScreening = useRepo(AdherenceScreening);

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
  putMobile(params: string) {
    return nSQL(AdherenceScreening.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        adherenceScreening.save(resp[0].affectedRows);
      });
  },
  getMobile() {
    return nSQL(AdherenceScreening.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        adherenceScreening.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(AdherenceScreening.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        adherenceScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
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
};
