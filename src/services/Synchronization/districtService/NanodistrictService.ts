import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import District from 'src/stores/models/district/District';
import { useRepo } from 'pinia-orm';

const district = useRepo(District);
export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('district?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(District.entity).query('upsert', resp.data).exec();
          district.save(resp.data);
          console.log('Data synced from backend: District');
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
