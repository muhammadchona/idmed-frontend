import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Role from 'src/stores/models/userLogin/Role';

const role = useRepo(Role);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('role', params)
      .then((resp) => {
        role.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('role?offset=' + offset + '&limit=100')
        .then((resp) => {
          role.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('role/' + id, params)
      .then((resp) => {
        role.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('role/' + id)
      .then(() => {
        role.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return role.getModel().$newInstance();
  },
  getAllFromStorage() {
    return role.all();
  },
};
