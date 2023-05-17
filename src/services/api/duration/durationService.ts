import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Duration from 'src/stores/models/duration/Duration';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const duration = useRepo(Duration);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('duration', params);
    duration.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('duration?offset=' + offset + '&max=100')
        .then((resp) => {
          duration.save(resp.data);
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
    const resp = await api().patch('duration/' + id, params);
    duration.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('duration/' + id);
    duration.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/duration?offset=' + offset + '&max=' + max);
  },

  async apiFetchById(id: string) {
    return await api().get(`/duration/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return duration.getModel().$newInstance();
  },
  getAllFromStorage() {
    return duration.all();
  },
};
