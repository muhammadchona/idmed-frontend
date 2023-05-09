import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';

const packagedDrug = useRepo(PackagedDrug);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('packagedDrug', params)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrug?offset=' + offset + '&limit=100')
        .then((resp) => {
          packagedDrug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('packagedDrug/' + id, params)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('packagedDrug/' + id)
      .then(() => {
        packagedDrug.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrug.all();
  },
};
