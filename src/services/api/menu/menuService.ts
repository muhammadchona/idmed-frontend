import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Menu from 'src/stores/models/userLogin/Menu';

const menu = useRepo(Menu);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api()
      .post('menu', params);
    menu.save(resp.data);
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
  async patch(id: number, params: string) {
    const resp = await api()
      .patch('menu/' + id, params);
    menu.save(resp.data);
  },
  async delete(id: number) {
    await api()
      .delete('menu/' + id);
    menu.destroy(id);
  },

  async apiGetAll() {
    return await api().get('/menu');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return menu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return menu.all();
  },
};
