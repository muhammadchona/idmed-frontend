import api from '../../api/apiService/apiService';
// import db from '../../../stores/dexie';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';

const identifierTypeDexie = db[IdentifierType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          identifierTypeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: IdentifierType');
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
    console.log('Data synced from backend To Piania IdentifierType');
    (await SynchronizationService.hasData(identifierTypeDexie))
      ? await identifierTypeService.getWeb(offset)
      : '';
  },
  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia IdentifierType');
    identifierTypeService.getMobile();
  },
};
