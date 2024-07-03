import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import userClinicsService from 'src/services/api/userClinics/userClinicsService';
import UserClinics from 'src/stores/models/userLogin/UserClinic';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('userClinic?offset=' + offset + '&max=100')
        .then((resp) => {
          userClinicsService.addBulkMobile(resp.data);
          console.log('Data synced from backend: UserClinics');
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
