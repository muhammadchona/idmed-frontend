import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import userRolesService from 'src/services/api/userRoles/userRolesService';
import UserRole from 'src/stores/models/userLogin/UserRole';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('userRole?offset=' + offset + '&max=100')
        .then((resp) => {
          userRolesService.addBulkMobile(resp.data);
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
