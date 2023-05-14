import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';

const interoperabilityType = useRepo(InteroperabilityType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('interoperabilityType', params)
      .then((resp) => {
        interoperabilityType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityType?offset=' + offset + '&limit=100')
        .then((resp) => {
          interoperabilityType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('interoperabilityType/' + id, params)
      .then((resp) => {
        interoperabilityType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('interoperabilityType/' + id)
      .then(() => {
        interoperabilityType.destroy(id);
      });
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/interoperabilityType?offset=' + offset + '&max=' + max
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/interoperabilityType/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityType.all();
  },
};
