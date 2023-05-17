import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const startStopReason = useRepo(StartStopReason);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('startStopReason', params);
    startStopReason.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('startStopReason?offset=' + offset + '&max=100')
        .then((resp) => {
          startStopReason.save(resp.data);
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
    const resp = await api().patch('startStopReason/' + id, params);
    startStopReason.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('startStopReason/' + id);
    startStopReason.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/startStopReason?offset=' + offset + '&max=' + max);
  },

  async apiFetchById(id: string) {
    return await api().get(`/startStopReason/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return startStopReason.getModel().$newInstance();
  },
  getAllFromStorage() {
    return startStopReason.all();
  },
};
