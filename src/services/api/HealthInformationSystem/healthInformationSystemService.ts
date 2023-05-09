import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';

const healthInformationSystem = useRepo(HealthInformationSystem);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('healthInformationSystem', params)
      .then((resp) => {
        healthInformationSystem.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('healthInformationSystem?offset=' + offset + '&limit=100')
        .then((resp) => {
          healthInformationSystem.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('healthInformationSystem/' + id, params)
      .then((resp) => {
        healthInformationSystem.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('healthInformationSystem/' + id)
      .then(() => {
        healthInformationSystem.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return healthInformationSystem.getModel().$newInstance();
  },
  getAllFromStorage() {
    return healthInformationSystem.all();
  },
};
