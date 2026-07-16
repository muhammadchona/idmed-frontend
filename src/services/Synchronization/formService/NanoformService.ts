import api from '../../api/apiService/apiService';
import Form from 'src/stores/models/form/Form';
import formService from 'src/services/api/formService/formService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const formDexie = db[Form.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('form?offset=' + offset + '&max=100')
        .then(async (resp) => {
          await formDexie.bulkPut(resp.data);
          console.log('Data synced from backend: Form');
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
    console.log('Data synced from backend To Piania Form');
    (await SynchronizationService.hasData(formDexie))
      ? await formService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia Form');
    return formService.getMobile();
  },
};
