import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SecUserRole from 'src/stores/models/userLogin/SecUserRole';

const secUserRole = useRepo(SecUserRole);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('secUserRole', params)
      .then((resp) => {
        secUserRole.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('secUserRole?offset=' + offset + '&limit=100')
        .then((resp) => {
          secUserRole.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('secUserRole/' + id, params)
      .then((resp) => {
        secUserRole.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('secUserRole/' + id)
      .then(() => {
        secUserRole.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secUserRole.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secUserRole.all();
  },
};
