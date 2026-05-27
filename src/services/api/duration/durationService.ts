import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Duration from 'src/stores/models/duration/Duration';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const duration = useRepo(Duration);
const durationDexie = db[Duration.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('duration', params);
      duration.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('duration?offset=' + offset + '&max=100')
        .then((resp) => {
          duration.save(resp.data);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('duration/' + uuid, params);
      duration.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('duration/' + uuid);
      duration.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return durationDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        duration.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return durationDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        duration.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return durationDexie
      .toArray()
      .then((rows: any) => {
        duration.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return durationDexie
      .delete(paramsId)
      .then(() => {
        duration.destroy(paramsId);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return durationDexie
      .bulkPut(params)
      .then(() => {
        duration.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/duration/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return duration.getModel().$newInstance();
  },
  getAllFromStorage() {
    return duration.orderBy('weeks', 'asc').get();
  },

  getDurationByWeeks(weeksSuply: any) {
    return duration.where('weeks', weeksSuply).first();
  },

  getDurationById(id: any) {
    return duration.where('id', id).first();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await durationDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
};
