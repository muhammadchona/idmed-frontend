import api from '../../api/apiService/apiService';
import facilityTypeService from 'src/services/api/facilityTypeService/facilityTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import FacilityType from 'src/stores/models/facilityType/FacilityType';

const facilityTypeDexie = db[FacilityType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('facilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          facilityTypeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: FacilityType');
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
    console.log('Data synced from backend To Piania FacilityType');
    (await SynchronizationService.hasData(facilityTypeDexie))
      ? await facilityTypeService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia FacilityType');
    facilityTypeService.getMobile();
  },
};
