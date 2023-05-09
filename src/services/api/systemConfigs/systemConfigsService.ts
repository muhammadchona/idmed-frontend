import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';

const systemConfigs = useRepo(SystemConfigs);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('systemConfigs', params)
      .then((resp) => {
        systemConfigs.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('systemConfigs?offset=' + offset + '&limit=100')
        .then((resp) => {
          systemConfigs.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('systemConfigs/' + id, params)
      .then((resp) => {
        systemConfigs.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('systemConfigs/' + id)
      .then(() => {
        systemConfigs.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return systemConfigs.getModel().$newInstance();
  },
  getAllFromStorage() {
    return systemConfigs.all();
  },
};
