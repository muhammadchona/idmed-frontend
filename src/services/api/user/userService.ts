import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SecUser from 'src/stores/models/userLogin/User';

const secUser = useRepo(SecUser);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('secUser', params);
    secUser.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('secUser?offset=' + offset + '&max=100')
        .then((resp) => {
          secUser.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('secUser/' + id, params);
    secUser.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('secUser/' + id);
    secUser.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/secUser?offset=' + offset + '&max=' + max);
  },
  async apiSave(userLogin: number) {
    return await api().post('/secUser', userLogin);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secUser.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secUser.all();
  },
};
