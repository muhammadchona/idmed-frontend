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

  async apiSave(episode: any, isNew: boolean) {
    if (isNew) {
      return await api().post('/episode', episode);
    } else {
      return await api().patch('/episode/' + episode.id, episode);
    }
  },

  async apiUpdate(episode: any) {
    return await api().patch('/episode/' + episode.id, episode);
  },

  async apiRemove(episode: any) {
    return await api().delete(`/episode/${episode.id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/episode/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/episode/${id}`);
  },

  async apiGetAllByIdentifierId(
    identifierId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/episode/identifier/' +
        identifierId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return episode.getModel().$newInstance();
  },
  getAllFromStorage() {
    return episode.all();
  },
  getEntity() {
    return episode.getModel();
  },
};
