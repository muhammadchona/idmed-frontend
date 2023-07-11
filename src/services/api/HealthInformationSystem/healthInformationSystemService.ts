import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';

const healthInformationSystem = useRepo(HealthInformationSystem);
const interoperabilityAttributeRepo = useRepo(InteroperabilityAttribute);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('healthInformationSystem', params);
      healthInformationSystem.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          healthInformationSystem.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inesperado nesta operação.');
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('healthInformationSystem/' + uuid, params);
      interoperabilityAttributeRepo
        .where('healthInformationSystem_id', resp.data.id)
        .delete();
      healthInformationSystem.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('healthInformationSystem/' + uuid);
      healthInformationSystem.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
     }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(healthInformationSystem.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        healthInformationSystem.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  getMobile() {
    return nSQL(healthInformationSystem.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        healthInformationSystem.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(healthInformationSystem.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        healthInformationSystem.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/healthInformationSystem/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/healthInformationSystem?offset=' + offset + '&max=' + max
    );
  },

  async apiSave(his: any) {
    return await api().post('/healthInformationSystem', his);
  },

  async apiUpdate(his: any) {
    return await api().patch('/healthInformationSystem/' + his.id, his);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return healthInformationSystem.getModel().$newInstance();
  },
  localSave(healtSystem: any) {
    healthInformationSystem.save(healtSystem);
  },
  getAllFromStorage() {
    return healthInformationSystem.all();
  },
  getAllActive() {
    return healthInformationSystem
      .with('interoperabilityAttributes')
      .where('active', true)
      .get();
  },

  getAllHis() {
    return healthInformationSystem
      .query()
      .with('interoperabilityAttributes', (query) => {
        query.with('interoperabilityType');
      })
      .get();
  },
};
