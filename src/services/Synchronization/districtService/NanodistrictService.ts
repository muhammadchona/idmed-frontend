import districtService from 'src/services/api/districtService/districtService';
import api from '../../api/apiService/apiService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('district?offset=' + offset + '&max=100')
        .then((resp) => {
          districtService.addBulkMobile(resp.data);
          console.log('Data synced from backend: District');
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
