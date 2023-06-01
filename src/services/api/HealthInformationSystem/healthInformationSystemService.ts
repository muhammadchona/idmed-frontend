import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const his = useRepo(HealthInformationSystem);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('healthInformationSystem', params)
      .then((resp) => {
        his.save(resp.data);
        alertSucess('O Registo foi efectuado com sucesso');
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
          alertError('Erro no porcessamento ' + String(listErrors));
        } else if (error.request) {
          alertError('Erro no registo ' + error.request);
        } else {
          alertError('Erro no registo ' + error.message);
        }
      });
  },
  patch(id: string, params: string) {
    return api()
      .patch('healthInformationSystem/' + id, params)
      .then((resp) => {
        his.save(resp.data);
        alertSucess('O Registo foi alterado com sucesso');
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
          alertError('Erro no porcessamento ' + String(listErrors));
        } else if (error.request) {
          alertError('Erro no registo ' + error.request);
        } else {
          alertError('Erro no registo ' + error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          his.save(resp.data);
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
  async delete(id: number) {
    await api().delete('healthInformationSystem/' + id);
    his.destroy(id);
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
    return his.getModel().$newInstance();
  },
  localSave(healtSystem: any) {
    his.save(healtSystem);
  },
  getAllFromStorage() {
    return his.all();
  },
  getAllActive() {
    return his.with('interoperabilityAttributes').where('active', true).get();
  },

  getAllHis() {
    return his
      .query()
      .with('interoperabilityAttributes', (query) => {
        query.with('interoperabilityType');
      })
      .get();
  },
};
