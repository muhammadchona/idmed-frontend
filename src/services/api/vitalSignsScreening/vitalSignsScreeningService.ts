import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import VitalSignsScreening from 'src/stores/models/screening/VitalSignsScreening';

const vitalSignsScreening = useRepo(VitalSignsScreening);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('vitalSignsScreening', params)
      .then((resp) => {
        vitalSignsScreening.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('vitalSignsScreening?offset=' + offset + '&limit=100')
        .then((resp) => {
          vitalSignsScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('vitalSignsScreening/' + id, params)
      .then((resp) => {
        vitalSignsScreening.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('vitalSignsScreening/' + id)
      .then(() => {
        vitalSignsScreening.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return vitalSignsScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return vitalSignsScreening.all();
  },
};
