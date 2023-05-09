import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SecUser from 'src/stores/models/userLogin/User';

const secUser = useRepo(SecUser);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('secUser', params)
      .then((resp) => {
        secUser.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('secUser?offset=' + offset + '&limit=100')
        .then((resp) => {
          secUser.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('secUser/' + id, params)
      .then((resp) => {
        secUser.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('secUser/' + id)
      .then(() => {
        secUser.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secUser.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secUser.all();
  },
};
