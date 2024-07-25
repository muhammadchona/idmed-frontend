import doctorService from 'src/services/api/doctorService/doctorService';
import api from '../../api/apiService/apiService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctorService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Doctor');
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
