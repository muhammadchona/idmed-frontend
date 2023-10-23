import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';
import { useRepo } from 'pinia-orm';

const interoperabilityAttribute = useRepo(InteroperabilityAttribute);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(InteroperabilityAttribute.entity)
            .query('upsert', resp.data)
            .exec();
          interoperabilityAttribute.save(resp.data);
          console.log('Data synced from backend: InteroperabilityAttribute');
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
