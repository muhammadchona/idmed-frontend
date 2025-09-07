import api from '../../api/apiService/apiService';
import drugService from 'src/services/api/drugService/drugService';
import SynchronizationService from '../SynchronizationService';
import Drug from 'src/stores/models/drug/Drug';
import db from 'src/stores/dexie';

const drugDexie = db[Drug.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          drugDexie.bulkPut(resp.data);
          console.log('Data synced from backend: Drug');
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
    console.log('Data synced from backend To Piania Drug');
    (await SynchronizationService.hasData(drugDexie))
      ? await drugService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia Drug');
    drugService.getMobile();
  },
};
