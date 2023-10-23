import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const startStopReason = useRepo(StartStopReason);

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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
      .post('startStopReason', params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('startStopReason?offset=' + offset + '&max=100')
        .then((resp) => {
          startStopReason.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('startStopReason/' + uuid, params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('startStopReason/' + uuid)
      .then(() => {
        startStopReason.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(startStopReason.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        startStopReason.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(startStopReason.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        startStopReason.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(startStopReason.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        startStopReason.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/startStopReason/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return startStopReason.getModel().$newInstance();
  },
  getAllFromStorage() {
    return startStopReason.all();
  },
  getAllStartReasons() {
    return startStopReason
      .where('isStartReason', true)
      .orderBy('reason', 'asc')
      .get();
  },
  getAllStopReasons() {
    return startStopReason
      .where('isStartReason', false)
      .orderBy('reason', 'asc')
      .get();
  },
  getById(id: string) {
    return startStopReason
      .query()
      .where((startStopReason) => {
        return startStopReason.id === id;
      })
      .get();
  },
};
