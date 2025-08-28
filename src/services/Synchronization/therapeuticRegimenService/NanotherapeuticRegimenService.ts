import api from '../../api/apiService/apiService';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService';

import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
const therapeuticalRegimenDexie = db[TherapeuticRegimen.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticRegimen?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticalRegimenDexie.bulkPut(resp.data);
          console.log('Data synced from backend: TherapeuticRegimen');
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
    console.log('Data synced from backend To Piania TherapeuticRegimen');
    (await SynchronizationService.hasData(therapeuticalRegimenDexie))
      ? await therapeuticalRegimenService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie TherapeuticRegimen');
    const getAllTherapeuticRegimen =
      therapeuticalRegimenService.getActiveTherapeuticalRegimens();
    await therapeuticalRegimenDexie.bulkPut(getAllTherapeuticRegimen);
  },
};
