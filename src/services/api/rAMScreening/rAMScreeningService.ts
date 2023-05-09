import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RAMScreening from 'src/stores/models/screening/RAMScreening';

const rAMScreening = useRepo(RAMScreening);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('rAMScreening', params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('rAMScreening?offset=' + offset + '&limit=100')
        .then((resp) => {
          rAMScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('rAMScreening/' + id, params)
      .then((resp) => {
        rAMScreening.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('rAMScreening/' + id)
      .then(() => {
        rAMScreening.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return rAMScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return rAMScreening.all();
  },
};
