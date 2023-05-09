import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';

const adherenceScreening = useRepo(AdherenceScreening);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('adherenceScreening', params)
      .then((resp) => {
        adherenceScreening.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('adherenceScreening?offset=' + offset + '&limit=100')
        .then((resp) => {
          adherenceScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('adherenceScreening/' + id, params)
      .then((resp) => {
        adherenceScreening.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('adherenceScreening/' + id)
      .then(() => {
        adherenceScreening.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return adherenceScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return adherenceScreening.all();
  },
};
