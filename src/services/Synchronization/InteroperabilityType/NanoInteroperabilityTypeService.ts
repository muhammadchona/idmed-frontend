import api from '../../api/apiService/apiService';
import InteroperabilityTypeService from 'src/services/api/InteroperabilityType/InteroperabilityTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';

const InteroperabilityTypeDexie = db[InteroperabilityType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          InteroperabilityTypeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: InteroperabilityType');
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
    console.log('Data synced from backend To Piania InteroperabilityType');
    (await SynchronizationService.hasData(InteroperabilityTypeDexie))
      ? await InteroperabilityTypeService.getWeb(offset)
      : '';
  },

  async warmMobileCache() {
    console.log('Refreshing InteroperabilityType cache from Dexie');
    return InteroperabilityTypeService.refreshMobileCache();
  },
};
