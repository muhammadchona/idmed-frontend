import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Role from 'src/stores/models/userLogin/Role';

const role = useRepo(Role);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('role', params);
    role.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('role?offset=' + offset + '&max=100')
        .then((resp) => {
          role.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('role/' + id, params);
    role.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('role/' + id);
    role.destroy(id);
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
    return role.getModel().$newInstance();
  },
  getAllFromStorage() {
    return role.all();
  },
};
