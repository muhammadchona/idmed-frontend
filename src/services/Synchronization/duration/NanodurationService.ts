import api from '../../api/apiService/apiService';
import durationService from 'src/services/api/duration/durationService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('duration?offset=' + offset + '&max=100')
        .then((resp) => {
          durationService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Duration');
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
