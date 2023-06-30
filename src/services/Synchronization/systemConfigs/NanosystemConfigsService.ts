import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(SystemConfigs.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: SystemConfigs');
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
