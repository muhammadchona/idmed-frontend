import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';

const adherenceScreening = useRepo(AdherenceScreening);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('adherenceScreening', params);
    adherenceScreening.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('adherenceScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          adherenceScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('adherenceScreening/' + id, params);
    adherenceScreening.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('adherenceScreening/' + id);
    adherenceScreening.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/adherenceScreening?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return adherenceScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return adherenceScreening.all();
  },
};
