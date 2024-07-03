import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import SystemConfigs from 'src/stores/models/systemConfigs/SystemConfigs';
import { useRepo } from 'pinia-orm';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
const systemConfigs = useRepo(SystemConfigs);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('systemConfigs?offset=' + offset + '&max=100')
        .then((resp) => {
          systemConfigsService.addBulkMobile(resp.data);
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
