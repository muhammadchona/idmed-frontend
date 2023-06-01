import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const interoperabilityType = useRepo(InteroperabilityType);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('interoperabilityType', params);
    interoperabilityType.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('interoperabilityType/' + id, params);
    interoperabilityType.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('interoperabilityType/' + id);
    interoperabilityType.destroy(id);
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
  getAll() {
    return interoperabilityType.query().withAll().get();
  },
};
