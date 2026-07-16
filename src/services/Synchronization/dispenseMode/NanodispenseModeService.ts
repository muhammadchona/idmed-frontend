import api from '../../api/apiService/apiService';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';

const dispenseModeDexie = db[DispenseMode.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('dispenseMode?offset=' + offset + '&max=100')
        .then(async (resp) => {
          await dispenseModeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: DispenseMode');
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
    console.log('Data synced from backend To Piania DispenseMode');
    (await SynchronizationService.hasData(dispenseModeDexie))
      ? await dispenseModeService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia DispenseMode');
    return dispenseModeService.getMobile();
  },
};
