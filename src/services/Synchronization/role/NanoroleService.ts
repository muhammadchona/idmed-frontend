import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import roleService from 'src/services/api/role/roleService';
import Role from 'src/stores/models/userLogin/Role';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('role?offset=' + offset + '&max=100')
        .then((resp) => {
          roleService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Role');
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
