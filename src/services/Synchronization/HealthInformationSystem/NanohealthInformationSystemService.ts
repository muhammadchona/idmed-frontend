import api from '../../api/apiService/apiService';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          healthInformationSystemService.addBulkMobile(resp.data);
          console.log('Data synced from backend: HealthInformationSystem');
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
