import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Role from 'src/stores/models/userLogin/Role';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const roleRepo = useRepo(Role);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('role', params);
    roleRepo.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('role?offset=' + offset + '&max=100')
        .then((resp) => {
          roleRepo.save(resp.data);
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
  async patch(id: number, params: string) {
    const resp = await api().patch('role/' + id, params);
    roleRepo.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('role/' + id);
    roleRepo.destroy(id);
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
    return roleRepo.getModel().$newInstance();
  },
  getAllFromStorage() {
    return roleRepo.all();
  },
  getActiveWithMenus() {
    return roleRepo.query().with('menus').where('active', true).get();
  },
};
