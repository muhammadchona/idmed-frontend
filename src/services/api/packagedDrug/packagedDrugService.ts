import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';

const packagedDrug = useRepo(PackagedDrug);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('packagedDrug', params);
    packagedDrug.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          packagedDrug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('packagedDrug/' + id, params);
    packagedDrug.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('packagedDrug/' + id);
    packagedDrug.destroy(id);
  },
  async apiGetAllByPackId(packId: string) {
    return await api().get('/packagedDrug/pack/' + packId);
  },

  async apiGetAll() {
    return await api().get('/packagedDrug?offset=' + 0 + '&max=' + 200);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrug.all();
  },
};
