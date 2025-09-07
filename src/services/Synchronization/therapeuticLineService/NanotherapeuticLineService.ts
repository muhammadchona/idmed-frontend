import api from '../../api/apiService/apiService';
import therapeuticLineService from 'src/services/api/therapeuticLineService/therapeuticLineService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import TherapeuticLine from 'src/stores/models/therapeuticLine/TherapeuticLine';

const therapeuticLineDexie = db[TherapeuticLine.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticLine?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticLineDexie.bulkPut(resp.data);
          console.log('Data synced from backend: TherapeuticLine');
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
    console.log('Data synced from backend To Piania TherapeuticLine');
    (await SynchronizationService.hasData(therapeuticLineDexie))
      ? await therapeuticLineService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia TherapeuticLine');
    therapeuticLineService.getMobile();
  },
};
