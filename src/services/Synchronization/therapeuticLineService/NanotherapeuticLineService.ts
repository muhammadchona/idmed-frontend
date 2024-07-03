import api from '../../api/apiService/apiService';
import therapeuticLineService from 'src/services/api/therapeuticLineService/therapeuticLineService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticLine?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticLineService.addBulkMobile(resp.data);
          console.log('Data synced from backend: TherapeuticLine');
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
