import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';
import { useRepo } from 'pinia-orm';

const identifierType = useRepo(IdentifierType);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(IdentifierType.entity).query('upsert', resp.data).exec();
          identifierType.save(resp.data);
          console.log('Data synced from backend: IdentifierType');
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
