import api from '../../api/apiService/apiService';
import InteroperabilityAttributeService from 'src/services/api/InteroperabilityAttribute/InteroperabilityAttributeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';

const InteroperabilityAttributeDexie = db[InteroperabilityAttribute.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          InteroperabilityAttributeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: InteroperabilityAttribute');
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
    console.log('Data synced from backend To Piania InteroperabilityAttribute');
    (await SynchronizationService.hasData(InteroperabilityAttributeDexie))
      ? await InteroperabilityAttributeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie InteroperabilityAttribute');
    const getAllInteroperabilityAttribute =
      InteroperabilityAttributeService.getAllFromStorage();
    await InteroperabilityAttributeDexie.bulkPut(
      getAllInteroperabilityAttribute
    );
  },
};
