import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import SecUserRole from 'src/stores/models/userLogin/SecUserRole';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('secUserRole?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(SecUserRole.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: SecUserRole');
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
