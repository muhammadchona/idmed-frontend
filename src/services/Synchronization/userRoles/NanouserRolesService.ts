import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import UserRole from 'src/stores/models/userLogin/UserRole';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('userRole?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(UserRole.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: UserRole');
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
