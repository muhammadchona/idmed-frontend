import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

const episodeType = useRepo(EpisodeType);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('episodeType', params);
    episodeType.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('episodeType?offset=' + offset + '&max=100')
        .then((resp) => {
          showloading();
          episodeType.save(resp.data);
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
    const resp = await api().patch('episodeType/' + id, params);
    episodeType.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('episodeType/' + id);
    episodeType.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/episodeType?offset=' + offset + '&max=' + max);
  },

  async apiFetchById(id: string) {
    return await api().get(`/episodeType/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return episodeType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return episodeType.all();
  },
};
