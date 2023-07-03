import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import { useRepo } from 'pinia-orm';
const startStopReason = useRepo(StartStopReason);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('startStopReason?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(StartStopReason.entity).query('upsert', resp.data).exec();
          startStopReason.save(resp.data);
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
};
