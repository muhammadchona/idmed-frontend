import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import TBScreening from 'src/stores/models/screening/TBScreening';

const tBScreening = useRepo(TBScreening);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('tBScreening', params)
      .then((resp) => {
        tBScreening.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('tBScreening?offset=' + offset + '&limit=100')
        .then((resp) => {
          tBScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('tBScreening/' + id, params)
      .then((resp) => {
        tBScreening.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('tBScreening/' + id)
      .then(() => {
        tBScreening.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return tBScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return tBScreening.all();
  },
};
