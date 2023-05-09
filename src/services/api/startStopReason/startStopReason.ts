import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';

const startStopReason = useRepo(StartStopReason);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('startStopReason', params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('startStopReason?offset=' + offset + '&limit=100')
        .then((resp) => {
          startStopReason.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('startStopReason/' + id, params)
      .then((resp) => {
        startStopReason.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('startStopReason/' + id)
      .then(() => {
        startStopReason.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return startStopReason.getModel().$newInstance();
  },
  getAllFromStorage() {
    return startStopReason.all();
  },
};
