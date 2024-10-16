import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';
import { useRepo } from 'pinia-orm';

const dispenseType = useRepo(DispenseType);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('dispenseType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(DispenseType.entity).query('upsert', resp.data).exec();
          dispenseType.save(resp.data);
          console.log('Data synced from backend: DispenseType');
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
