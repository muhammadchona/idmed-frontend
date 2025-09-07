import districtService from 'src/services/api/districtService/districtService';
import api from '../../api/apiService/apiService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import District from 'src/stores/models/district/District';

const districtDexie = db[District.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('district?offset=' + offset + '&max=100')
        .then((resp) => {
          districtDexie.bulkPut(resp.data);
          console.log('Data synced from backend: District');
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
    console.log('Data synced from backend To Piania District');
    (await SynchronizationService.hasData(districtDexie))
      ? await districtService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia District');
    districtService.getMobile();
  },
};
