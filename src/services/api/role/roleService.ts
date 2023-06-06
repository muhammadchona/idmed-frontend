import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Role from 'src/stores/models/userLogin/Role';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const rolerepo = useRepo(Role);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('role', params)
      .then((resp) => {
        rolerepo.save(resp.data);
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
          alertError(String(listErrors));
        } else if (error.request) {
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  patch(id: number, params: string) {
    return api()
      .patch('role/' + id, params)
      .then((resp) => {
        rolerepo.save(resp.data);
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
          alertError(String(listErrors));
        } else if (error.request) {
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('role?offset=' + offset + '&max=100')
        .then((resp) => {
          rolerepo.save(resp.data);
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
    await api().delete('role/' + id);
    rolerepo.destroy(id);
  },

  async apiGetAll() {
    return await api().get('/role');
  },
  async apiSave(role: any) {
    return await api().post('/role', role);
  },
  async apiUpdate(role: any) {
    return await api().put('/role/', role);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return rolerepo.getModel().$newInstance();
  },
  getAllFromStorage() {
    return rolerepo.all();
  },
  getActiveWithMenus() {
    return rolerepo.query().with('menus').where('active', true).get();
  },
  getAllWithMenus() {
    return rolerepo.query().with('menus').get();
  },
};
