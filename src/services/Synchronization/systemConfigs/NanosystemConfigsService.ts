import api from '../../api/apiService/apiService';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
const systemConfigsDexie = db[SystemConfigs.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          systemConfigsDexie.bulkPut(resp.data);
          console.log('Data synced from backend: SystemConfigs');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania SystemConfigs');
    (await SynchronizationService.hasData(systemConfigsDexie))
      ? await systemConfigsService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia SystemConfigs');
    systemConfigsService.getMobile();
  },
};
