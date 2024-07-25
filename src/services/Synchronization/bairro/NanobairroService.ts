import api from '../../api/apiService/apiService';
import bairroService from 'src/services/api/bairro/bairroService';
export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('localidade?offset=' + offset + '&max=100')
        .then((resp) => {
          bairroService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Localidade');
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
