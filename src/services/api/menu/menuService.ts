import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Menu from 'src/stores/models/userLogin/Menu';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const menuRepo = useRepo(Menu);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('menu', params);
    menuRepo.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('menu?offset=' + offset + '&max=100')
        .then((resp) => {
          menuRepo.save(resp.data);
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
    const resp = await api().patch('menu/' + id, params);
    menuRepo.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('menu/' + id);
    menuRepo.destroy(id);
  },

  async apiGetAll() {
    return await api().get('/menu');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return menuRepo.getModel().$newInstance();
  },
  getAllFromStorage() {
    return menuRepo.all();
  },
  getAll() {
    return menuRepo.query().withAll().get();
  },
};
