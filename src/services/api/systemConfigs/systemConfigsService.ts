import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const systemConfigs = useRepo(SystemConfigs);
const systemConfigsDexie = SystemConfigs.entity;

const { closeLoading } = useLoading();
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
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      console.log(api().instance);
      const resp = await api().post('systemConfigs', params);
      systemConfigs.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          systemConfigs.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('systemConfigs/' + uuid, params);
      systemConfigs.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('systemConfigs/' + uuid);
      systemConfigs.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[systemConfigsDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        systemConfigs.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[systemConfigsDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        systemConfigs.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[systemConfigsDexie]
      .toArray()
      .then((rows: any) => {
        systemConfigs.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[systemConfigsDexie]
      .delete(paramsId)
      .then(() => {
        systemConfigs.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[systemConfigsDexie]
      .bulkPut(params)
      .then(() => {
        systemConfigs.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiFetchById(id: any) {
    return await api().get(`/systemConfigs/${id}`);
  },
  async apiGetAll() {
    return this.get(0);
  },
  async apiSave(systemConfigs: any) {
    return await this.post(systemConfigs);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return systemConfigs.getModel().$newInstance();
  },
  getAllFromStorage() {
    return systemConfigs.all();
  },

  saveInStorage(systemConfigsObj: any) {
    return systemConfigs.save(systemConfigsObj);
  },

  getActiveDataMigration() {
    return systemConfigs
      .query()
      .where('key', 'ACTIVATE_DATA_MIGRATION')
      .first();
  },

  getInstallationType() {
    return systemConfigs.query().where('key', 'INSTALATION_TYPE').first();
  },

  getApiURL() {
    return systemConfigs.query().where('key', 'API_URL').first();
  },
  deleteAllFromStorage() {
    systemConfigs.flush();
  },
};
