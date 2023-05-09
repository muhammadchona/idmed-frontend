import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Group from 'src/stores/models/group/Group';

const group = useRepo(Group);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('group', params)
      .then((resp) => {
        group.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('group?offset=' + offset + '&limit=100')
        .then((resp) => {
          group.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('group/' + id, params)
      .then((resp) => {
        group.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('group/' + id)
      .then(() => {
        group.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return group.getModel().$newInstance();
  },
  getAllFromStorage() {
    return group.all();
  },
};
