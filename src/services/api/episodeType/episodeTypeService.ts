import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';

const episodeType = useRepo(EpisodeType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('episodeType', params)
      .then((resp) => {
        episodeType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('episodeType?offset=' + offset + '&limit=100')
        .then((resp) => {
          episodeType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('episodeType/' + id, params)
      .then((resp) => {
        episodeType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('episodeType/' + id)
      .then(() => {
        episodeType.destroy(id);
      });
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
