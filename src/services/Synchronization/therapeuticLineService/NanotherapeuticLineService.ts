import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import TherapeuticLine from 'src/stores/models/therapeuticLine/TherapeuticLine';
import { useRepo } from 'pinia-orm';
const therapeuticLine = useRepo(TherapeuticLine);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticLine?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(TherapeuticLine.entity).query('upsert', resp.data).exec();
          therapeuticLine.save(resp.data);
          console.log('Data synced from backend: TherapeuticLine');
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
