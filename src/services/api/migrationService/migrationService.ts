import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import MigrationStage from '../../../stores/models/Migration/MigrationStage';
import systemConfigsService from '../systemConfigs/systemConfigsService';

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

  async apiMigrationStatusIsFinished() {
    return await api().get('/migration/migrationStatusFinished');
  },

  async finishMigration() {
    return await api()
      .post('/migration/migrationCompleted')
      .then((resp) => {
        const migrationStage = this.getFromStorageByCode(
          'PATIENT_MIGRATION_STAGE'
        );
        migrationStage.value = 'COMPLETED';
        migrationStages.save(migrationStage);
        const systemConfigs = systemConfigsService.getActiveDataMigration();
        systemConfigs.value = false;
        systemConfigsService.saveInStorage(systemConfigs);
        return resp;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return migrationStages.getModel().$newInstance();
  },

  getAllFromStorage() {
    return migrationStages.all();
  },
  getFromStorageByCode(code: String) {
    return migrationStages.where('code', code).first();
  },
};
