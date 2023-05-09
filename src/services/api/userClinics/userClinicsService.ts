import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UserClinics from 'src/stores/models/userLogin/UserClinic';

const userClinic = useRepo(UserClinics);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('userClinic', params)
      .then((resp) => {
        userClinic.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('userClinic?offset=' + offset + '&limit=100')
        .then((resp) => {
          userClinic.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('userClinic/' + id, params)
      .then((resp) => {
        userClinic.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('userClinic/' + id)
      .then(() => {
        userClinic.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return userClinic.getModel().$newInstance();
  },
  getAllFromStorage() {
    return userClinic.all();
  },
};
