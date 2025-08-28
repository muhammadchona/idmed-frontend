import api from '../../api/apiService/apiService';
import startStopReasonService from 'src/services/api/startStopReasonService/startStopReasonService';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const startStopReasonDexie = db[StartStopReason.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('startStopReason?offset=' + offset + '&max=100')
        .then((resp) => {
          startStopReasonDexie.bulkPut(resp.data);
          console.log('Data synced from backend: StartStopReason');
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
    console.log('Data synced from backend To Piania StartStopReason');
    (await SynchronizationService.hasData(startStopReasonDexie))
      ? await startStopReasonService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie StartStopReason');
    const getAllStartStopReason = startStopReasonService.getAllFromStorage();
    await startStopReasonDexie.bulkPut(getAllStartStopReason);
  },
};
