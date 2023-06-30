import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import TBScreening from 'src/stores/models/screening/TBScreening';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('tBScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(TBScreening.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: TBScreening');
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
