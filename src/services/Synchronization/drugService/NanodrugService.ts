import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import Drug from 'src/stores/models/drug/Drug';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(Drug.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: Drug');
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
