import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import VitalSignsScreening from 'src/stores/models/screening/VitalSignsScreening';

const vitalSignsScreening = useRepo(VitalSignsScreening);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('vitalSignsScreening', params);
    vitalSignsScreening.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('vitalSignsScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          vitalSignsScreening.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('vitalSignsScreening/' + id, params);
    vitalSignsScreening.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('vitalSignsScreening/' + id);
    vitalSignsScreening.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/vitalSignsScreening?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return vitalSignsScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return vitalSignsScreening.all();
  },
};
