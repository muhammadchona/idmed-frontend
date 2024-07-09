import api from '../../api/apiService/apiService';
import episodeService from 'src/services/api/episode/episodeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('episode?offset=' + offset + '&max=100')
        .then((resp) => {
          episodeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Episode');
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
