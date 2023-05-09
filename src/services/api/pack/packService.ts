import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Pack from 'src/stores/models/packaging/Pack';

const pack = useRepo(Pack);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('pack', params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pack?offset=' + offset + '&limit=100')
        .then((resp) => {
          pack.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('pack/' + id, params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('pack/' + id)
      .then(() => {
        pack.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return pack.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pack.all();
  },
};
