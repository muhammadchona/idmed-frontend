import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UserRoles from 'src/stores/models/userLogin/UserRole';

const userRole = useRepo(UserRoles);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('userRole', params);
    userRole.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('userRole?offset=' + offset + '&max=100')
        .then((resp) => {
          userRole.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('userRole/' + id, params);
    userRole.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('userRole/' + id);
    userRole.destroy(id);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return userRole.getModel().$newInstance();
  },
  getAllFromStorage() {
    return userRole.all();
  },
};
