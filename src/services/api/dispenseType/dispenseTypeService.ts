import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';

const dispenseType = useRepo(DispenseType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('dispenseType', params)
      .then((resp) => {
        dispenseType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('dispenseType?offset=' + offset + '&limit=100')
        .then((resp) => {
          dispenseType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('dispenseType/' + id, params)
      .then((resp) => {
        dispenseType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('dispenseType/' + id)
      .then(() => {
        dispenseType.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return dispenseType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return dispenseType.all();
  },
};
