import api from '../../api/apiService/apiService';
import durationService from 'src/services/api/duration/durationService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import Duration from 'src/stores/models/duration/Duration';

const durationDexie = db[Duration.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('duration?offset=' + offset + '&max=100')
        .then((resp) => {
          durationDexie.bulkPut(resp.data);
          console.log('Data synced from backend: Duration');
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
    console.log('Data synced from backend To Piania Duration');
    (await SynchronizationService.hasData(durationDexie))
      ? await durationService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia Duration');
    durationService.getMobile();
  },
};
