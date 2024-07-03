import api from '../../api/apiService/apiService';
import InteroperabilityAttributeService from 'src/services/api/InteroperabilityAttribute/InteroperabilityAttributeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          InteroperabilityAttributeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: InteroperabilityAttribute');
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
