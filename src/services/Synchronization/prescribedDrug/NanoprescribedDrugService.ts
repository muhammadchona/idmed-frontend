import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('prescribedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(PrescribedDrug.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: PrescribedDrug');
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
