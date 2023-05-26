import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const systemconfigs = useRepo(SystemConfigs);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('systemConfigs', params)
      .then((resp) => {
        systemconfigs.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
      })
      .catch((error) => {
        if (error.request != null) {
          const arrayErrors = JSON.parse(error.request.response);
          const listErrors = [];
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
          alertError('Erro no porcessamento', String(listErrors));
        } else if (error.request) {
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          systemconfigs.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          closeLoading;
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = {};
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alertError('Erro no porcessamento', String(listErrors));
          } else if (error.request) {
            alertError('Erro no registo', error.request);
          } else {
            alertError('Erro no registo', error.message);
          }
        });
    }
  },
  patch(id: string, params: string) {
    return api()
      .patch('systemConfigs/' + id, params)
      .then((resp) => {
        systemconfigs.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
      })
      .catch((error) => {
        if (error.request != null) {
          const arrayErrors = JSON.parse(error.request.response);
          const listErrors = {};
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
          alertError('Erro no porcessamento', String(listErrors));
        } else if (error.request) {
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  async delete(id: number) {
    await api().delete('systemConfigs/' + id);
    systemconfigs.destroy(id);
  },
  async apiFetchById(id: any) {
    return await api().get(`/systemConfigs/${id}`);
  },
  async apiGetAll() {
    return await api().get('/systemConfigs');
  },
  async apiSave(systemConfigs: any) {
    return await api().post('/systemConfigs', systemConfigs);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return systemconfigs.getModel().$newInstance();
  },
  getAllFromStorage() {
    return systemconfigs.all();
  },

  getActiveDataMigration() {
    return systemconfigs
      .query()
      .where('key', 'ACTIVATE_DATA_MIGRATION')
      .first();
  },
};
