import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';
import { useRepo } from 'pinia-orm';
const therapeuticRegimen = useRepo(TherapeuticRegimen);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticRegimen?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(TherapeuticRegimen.entity).query('upsert', resp.data).exec();
          therapeuticRegimen.save(resp.data);
          console.log('Data synced from backend: TherapeuticRegimen');
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
