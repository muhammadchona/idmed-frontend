import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RAMScreening from 'src/stores/models/screening/RAMScreening';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const rAMScreening = useRepo(RAMScreening);
const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile.value, isOnline.value } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
      this.putMobile(params);
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
  putMobile(params: string) {
    return nSQL(RAMScreening.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        rAMScreening.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(RAMScreening.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        rAMScreening.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(RAMScreening.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        rAMScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
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
};
