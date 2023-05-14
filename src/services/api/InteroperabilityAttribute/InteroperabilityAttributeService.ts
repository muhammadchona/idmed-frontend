import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';

const interoperabilityAttribute = useRepo(InteroperabilityAttribute);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('interoperabilityAttribute', params);
    interoperabilityAttribute.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityAttribute?offset=' + offset + '&limit=100')
        .then((resp) => {
          interoperabilityAttribute.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('interoperabilityAttribute/' + id, params);
    interoperabilityAttribute.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('interoperabilityAttribute/' + id);
    interoperabilityAttribute.destroy(id);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/interoperabilityAttribute?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityAttribute.all();
  },
};
