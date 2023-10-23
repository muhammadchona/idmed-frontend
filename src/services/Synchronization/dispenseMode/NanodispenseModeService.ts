import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';
import { useRepo } from 'pinia-orm';

const dispenseMode = useRepo(DispenseMode);
export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('dispenseMode?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(DispenseMode.entity).query('upsert', resp.data).exec();
          dispenseMode.save(resp.data);
          console.log('Data synced from backend: DispenseMode');
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
