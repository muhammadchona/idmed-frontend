import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import clinicService from 'src/services/api/clinicService/clinicService';
import Clinic from 'src/stores/models/clinic/Clinic';
import { useRepo } from 'pinia-orm';

import { useLoading } from 'src/composables/shared/loading/loading';
const { closeLoading, showloading } = useLoading();
const clinic = useRepo(Clinic);

export default {
  async getFromBackEnd(offset: number) {
    showloading();
    if (offset >= 0) {
      return await api()
        .get('clinic?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Clinic');
          clinicService.savePinia(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
          closeLoading();
        });
    }
  },
};
