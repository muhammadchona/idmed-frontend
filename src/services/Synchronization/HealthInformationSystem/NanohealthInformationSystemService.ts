import api from '../../api/apiService/apiService';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';

const healthInformationSystemDexie = db[HealthInformationSystem.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          healthInformationSystemDexie.bulkPut(resp.data);
          console.log('Data synced from backend: HealthInformationSystem');
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
    console.log('Data synced from backend To Piania HealthInformationSystem');
    (await SynchronizationService.hasData(healthInformationSystemDexie))
      ? await healthInformationSystemService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia HealthInformationSystem');
    healthInformationSystemService.getMobile();
  },
};
