import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Episode from 'src/stores/models/episode/Episode';

const episode = useRepo(Episode);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('episode', params)
      .then((resp) => {
        episode.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('episode?offset=' + offset + '&limit=100')
        .then((resp) => {
          episode.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('episode/' + id, params)
      .then((resp) => {
        episode.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('episode/' + id)
      .then(() => {
        episode.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return episode.getModel().$newInstance();
  },
  getAllFromStorage() {
    return episode.all();
  },
};
