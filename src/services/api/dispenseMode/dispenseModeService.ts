import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const dispenseMode = useRepo(DispenseMode);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('dispenseMode', params);
    dispenseMode.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('dispenseMode?offset=' + offset + '&max=100')
        .then((resp) => {
          dispenseMode.save(resp.data);
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
    const resp = await api().patch('dispenseMode/' + id, params);
    dispenseMode.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('dispenseMode/' + id);
    dispenseMode.destroy(id);
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
