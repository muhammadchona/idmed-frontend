import api from '../../api/apiService/apiService';
import appointmentService from 'src/services/api/appointment/appointmentService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('apointment?offset=' + offset + '&max=100')
        .then((resp) => {
          appointmentService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Appointment');
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
