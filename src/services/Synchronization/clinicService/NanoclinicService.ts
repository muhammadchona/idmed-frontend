import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import clinicService from 'src/services/api/clinicService/clinicService';
import Clinic from 'src/stores/models/clinic/Clinic';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinic?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(Clinic.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: Clinic');
          clinicService.savePinia(resp.data)
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
