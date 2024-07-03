import api from '../../api/apiService/apiService';
import adherenceScreeningService from 'src/services/api/adherenceScreening/adherenceScreeningService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('adherenceScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          adherenceScreeningService.addBulkMobile(resp.data);
          console.log('Data synced from backend: AdherenceScreening');
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
