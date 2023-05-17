import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UserClinics from 'src/stores/models/userLogin/UserClinic';

const userClinic = useRepo(UserClinics);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('userClinic', params);
    userClinic.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('userClinic?offset=' + offset + '&max=100')
        .then((resp) => {
          userClinic.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('userClinic/' + id, params);
    userClinic.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('userClinic/' + id);
    userClinic.destroy(id);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return userClinic.getModel().$newInstance();
  },
  getAllFromStorage() {
    return userClinic.all();
  },
};
