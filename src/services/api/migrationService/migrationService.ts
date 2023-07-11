import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import MigrationStage from '../../../stores/models/Migration/MigrationStage';

const migrationStages = useRepo(MigrationStage);

export default {
  async apiGetAll() {
    const resp = await api().get('/migration');
    migrationStages.save(resp.data);
    console.log(resp.data);
    return resp;
  },

  async initMigration() {
    return await api().post('/migration/initMigration');
  },

  async apiFetchById(id) {
    return await api().get(`/migration/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return migrationStages.getModel().$newInstance();
  },

  getAllFromStorage() {
    return migrationStages.all();
  },
};
