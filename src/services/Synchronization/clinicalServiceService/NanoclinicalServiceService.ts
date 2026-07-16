import api from '../../api/apiService/apiService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const clinicalServiceDexie = db[ClinicalService.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicalService?offset=' + offset + '&max=100')
        .then(async (resp) => {
          await clinicalServiceDexie.bulkPut(resp.data);
          console.log('Data synced from backend: ClinicalService');
          offset = offset + 100;
          if (resp.data.length > 0) {
            return this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
          throw error;
        });
    }
  },
  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania ClinicalService');
    (await SynchronizationService.hasData(clinicalServiceDexie))
      ? await clinicalServiceService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia ClinicalService');
    return clinicalServiceService.getMobile();
  },
};
