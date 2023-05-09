import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Menu from 'src/stores/models/userLogin/Menu';

const menu = useRepo(Menu);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('menu', params)
      .then((resp) => {
        menu.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('menu?offset=' + offset + '&limit=100')
        .then((resp) => {
          menu.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('menu/' + id, params)
      .then((resp) => {
        menu.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('menu/' + id)
      .then(() => {
        menu.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return menu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return menu.all();
  },
};
