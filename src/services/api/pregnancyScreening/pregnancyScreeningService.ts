import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PregnancyScreening from 'src/stores/models/screening/PregnancyScreening';

const pregnancyScreening = useRepo(PregnancyScreening);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('pregnancyScreening', params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pregnancyScreening?offset=' + offset + '&limit=100')
        .then((resp) => {
          pregnancyScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('pregnancyScreening/' + id, params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('pregnancyScreening/' + id)
      .then(() => {
        pregnancyScreening.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return pregnancyScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pregnancyScreening.all();
  },
};
