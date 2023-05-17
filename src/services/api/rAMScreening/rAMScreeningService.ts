import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RAMScreening from 'src/stores/models/screening/RAMScreening';

const rAMScreening = useRepo(RAMScreening);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('rAMScreening', params);
    rAMScreening.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('rAMScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          rAMScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('rAMScreening/' + id, params);
    rAMScreening.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('rAMScreening/' + id);
    rAMScreening.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/RAMScreening?offset=' + offset + '&max=' + max);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return rAMScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return rAMScreening.all();
  },
};
