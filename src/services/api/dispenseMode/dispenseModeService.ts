import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';

const dispenseMode = useRepo(DispenseMode);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('dispenseMode', params)
      .then((resp) => {
        dispenseMode.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('dispenseMode?offset=' + offset + '&limit=100')
        .then((resp) => {
          dispenseMode.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('dispenseMode/' + id, params)
      .then((resp) => {
        dispenseMode.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('dispenseMode/' + id)
      .then(() => {
        dispenseMode.destroy(id);
      });
  },
  async apiGetAll() {
    return await api().get('/dispenseMode');
  },

  async apiFetchById(id: string) {
    return await api().get(`/dispenseMode/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return dispenseMode.getModel().$newInstance();
  },
  getAllFromStorage() {
    return dispenseMode.all();
  },
};
