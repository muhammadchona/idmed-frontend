import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';

const packagedDrugStock = useRepo(PackagedDrugStock);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('packagedDrugStock', params);
    packagedDrugStock.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrugStock?offset=' + offset + '&max=100')
        .then((resp) => {
          packagedDrugStock.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('packagedDrugStock/' + id, params);
    packagedDrugStock.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('packagedDrugStock/' + id);
    packagedDrugStock.destroy(id);
  },

  async apiGetAll() {
    return await api().get('/packagedDrugStock?offset=' + 0 + '&max=' + 200);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrugStock.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrugStock.all();
  },
};
