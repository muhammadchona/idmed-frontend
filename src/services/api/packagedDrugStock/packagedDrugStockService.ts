import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';

const packagedDrugStock = useRepo(PackagedDrugStock);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('packagedDrugStock', params)
      .then((resp) => {
        packagedDrugStock.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrugStock?offset=' + offset + '&limit=100')
        .then((resp) => {
          packagedDrugStock.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('packagedDrugStock/' + id, params)
      .then((resp) => {
        packagedDrugStock.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('packagedDrugStock/' + id)
      .then(() => {
        packagedDrugStock.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrugStock.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrugStock.all();
  },
};
