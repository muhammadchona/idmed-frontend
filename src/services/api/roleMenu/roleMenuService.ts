import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RoleMenu from 'src/stores/models/userLogin/RoleMenu';

const roleMenu = useRepo(RoleMenu);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('roleMenu', params)
      .then((resp) => {
        roleMenu.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('roleMenu?offset=' + offset + '&limit=100')
        .then((resp) => {
          roleMenu.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('roleMenu/' + id, params)
      .then((resp) => {
        roleMenu.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('roleMenu/' + id)
      .then(() => {
        roleMenu.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return roleMenu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return roleMenu.all();
  },
};
