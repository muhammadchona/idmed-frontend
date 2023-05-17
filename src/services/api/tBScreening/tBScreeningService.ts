import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import TBScreening from 'src/stores/models/screening/TBScreening';

const tBScreening = useRepo(TBScreening);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('tBScreening', params);
    tBScreening.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('tBScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          tBScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('tBScreening/' + id, params);
    tBScreening.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('tBScreening/' + id);
    tBScreening.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/TBScreening?offset=' + offset + '&max=' + max);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return tBScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return tBScreening.all();
  },
};
