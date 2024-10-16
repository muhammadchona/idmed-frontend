import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import Duration from 'src/stores/models/duration/Duration';
import { useRepo } from 'pinia-orm';
const duration = useRepo(Duration);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('duration?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(Duration.entity).query('upsert', resp.data).exec();
          duration.save(resp.data);
          console.log('Data synced from backend: Duration');
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
