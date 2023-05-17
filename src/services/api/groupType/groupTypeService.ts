import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupType from 'src/stores/models/groupType/GroupType';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const groupType = useRepo(GroupType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupType', params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupType?offset=' + offset + '&max=100')
        .then((resp) => {
          groupType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupType/' + id, params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupType/' + id)
      .then(() => {
        groupType.destroy(id);
      });
  },

  async apiGetAll() {
    return await api().get('/groupType');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return groupType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupType.all();
  },
};
