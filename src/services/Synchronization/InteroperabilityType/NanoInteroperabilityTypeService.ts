import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';
import { useRepo } from 'pinia-orm';

const interoperabilityType = useRepo(InteroperabilityType);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(InteroperabilityType.entity).query('upsert', resp.data).exec();
          interoperabilityType.save(resp.data);
          console.log('Data synced from backend: InteroperabilityType');
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
