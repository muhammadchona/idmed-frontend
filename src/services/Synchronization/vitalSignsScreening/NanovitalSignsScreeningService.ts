import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import db from '../../../stores/dexie';
import VitalSignsScreening from 'src/stores/models/screening/VitalSignsScreening';

const vitalSignsScreeningDexie = db[VitalSignsScreening.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('apointment?offset=' + offset + '&max=100')
        .then((resp) => {
          vitalSignsScreeningDexie.bulkPut(resp.data);
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
