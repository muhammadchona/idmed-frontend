import api from '../../api/apiService/apiService';
import provincialServerService from 'src/services/api/provincialServerService/provincialServerService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import ProvincialServer from 'src/stores/models/provincialServer/ProvincialServer';

const provincialServerDexie = db[ProvincialServer.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('provincialServer?offset=' + offset + '&max=100')
        .then((resp) => {
          provincialServerDexie.bulkPut(resp.data);
          console.log('Data synced from backend: ProvincialServer');
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
    console.log('Data synced from backend To Piania ProvincialServer');
    (await SynchronizationService.hasData(provincialServerDexie))
      ? await provincialServerService.getWeb(offset)
      : '';
  },

  async warmMobileCache() {
    console.log('Refreshing ProvincialServer cache from Dexie');
    return provincialServerService.refreshMobileCache();
  },
};
