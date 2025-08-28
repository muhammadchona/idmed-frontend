import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import Prescription from 'src/stores/models/prescription/Prescription';

import db from 'src/stores/dexie';

const prescriptionDexie = db[Prescription.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('prescription?offset=' + offset + '&max=100')
        .then((resp) => {
          prescriptionDexie.bulkPut(resp.data);
          console.log('Data synced from backend: Prescription');
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
