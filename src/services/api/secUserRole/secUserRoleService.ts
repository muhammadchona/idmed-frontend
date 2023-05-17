import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SecUserRole from 'src/stores/models/userLogin/SecUserRole';

const secUserRole = useRepo(SecUserRole);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('secUserRole', params);
    secUserRole.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('secUserRole?offset=' + offset + '&max=100')
        .then((resp) => {
          secUserRole.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('secUserRole/' + id, params);
    secUserRole.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('secUserRole/' + id);
    secUserRole.destroy(id);
  },

  async apiSave(secUserRole: string) {
    return await api().post('/secUserRole', secUserRole);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secUserRole.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secUserRole.all();
  },
};
