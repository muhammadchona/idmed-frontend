import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import PatientTransReferenceType from 'src/stores/models/transreference/PatientTransReferenceType';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(PatientTransReferenceType.entity)
            .query('upsert', resp.data)
            .exec();
          console.log('Data synced from backend: PatientTransReferenceType');
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
