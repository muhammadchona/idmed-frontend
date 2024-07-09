import api from '../../api/apiService/apiService';
import roleMenuService from 'src/services/api/roleMenu/roleMenuService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('roleMenu?offset=' + offset + '&max=100')
        .then((resp) => {
          roleMenuService.addBulkMobile(resp.data);
          console.log('Data synced from backend: RoleMenu');
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
