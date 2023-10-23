import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';
import { useRepo } from 'pinia-orm';

const healthInformationSystem = useRepo(HealthInformationSystem);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(HealthInformationSystem.entity)
            .query('upsert', resp.data)
            .exec();
          healthInformationSystem.save(resp.data);
          console.log('Data synced from backend: HealthInformationSystem');
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
