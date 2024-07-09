import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import clinicalServiceAttributeService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService';
import ClinicalServiceAttribute from 'src/stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicalServiceAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalServiceAttributeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: ClinicalServiceAttribute');
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
