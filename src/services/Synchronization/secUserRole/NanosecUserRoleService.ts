import api from '../../api/apiService/apiService';
import secUserRoleService from 'src/services/api/secUserRole/secUserRoleService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('secUserRole?offset=' + offset + '&max=100')
        .then((resp) => {
          secUserRoleService.addBulkMobile(resp.data);
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
