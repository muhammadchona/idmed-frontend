import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RoleMenu from 'src/stores/models/userLogin/RoleMenu';

const roleMenu = useRepo(RoleMenu);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('roleMenu', params);
    roleMenu.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('roleMenu?offset=' + offset + '&max=100')
        .then((resp) => {
          roleMenu.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('roleMenu/' + id, params);
    roleMenu.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('roleMenu/' + id);
    roleMenu.destroy(id);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return roleMenu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return roleMenu.all();
  },
};
