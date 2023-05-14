import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';

const systemConfigs = useRepo(SystemConfigs);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('systemConfigs', params);
    systemConfigs.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('systemConfigs?offset=' + offset + '&limit=100')
        .then((resp) => {
          systemConfigs.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('systemConfigs/' + id, params);
    systemConfigs.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('systemConfigs/' + id);
    systemConfigs.destroy(id);
  },
  async apiFetchById(id: any) {
    return await api().get(`/systemConfigs/${id}`);
  },
  async apiGetAll() {
    return await api().get('/systemConfigs');
  },
  async apiSave(systemConfigs: any) {
    return await api().post('/systemConfigs', systemConfigs);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return systemConfigs.getModel().$newInstance();
  },
  getAllFromStorage() {
    return systemConfigs.all();
  },

  getActiveDataMigration() {
    return systemConfigs
      .query()
      .where('key', 'ACTIVATE_DATA_MIGRATION')
      .first();
  },
};
