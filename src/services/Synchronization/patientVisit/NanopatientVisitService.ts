import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientVisit?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(PatientVisit.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: PatientVisit');
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
