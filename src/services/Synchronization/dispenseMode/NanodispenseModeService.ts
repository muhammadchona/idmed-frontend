import api from '../../api/apiService/apiService';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('dispenseMode?offset=' + offset + '&max=100')
        .then((resp) => {
          dispenseModeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: DispenseMode');
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
