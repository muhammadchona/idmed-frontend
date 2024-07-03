import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import therapeuticRegimensDrugService from 'src/services/api/therapeuticRegimensDrugService/therapeuticRegimensDrugService';
import TherapeuticRegimensDrug from 'src/stores/models/TherapeuticRegimensDrug/TherapeuticRegimensDrug';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticRegimensDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimensDrugService.addBulkMobile(resp.data);
          console.log('Data synced from backend: TherapeuticRegimensDrug');
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
