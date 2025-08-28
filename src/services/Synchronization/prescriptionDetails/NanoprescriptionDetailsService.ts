import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import PrescriptionDetail from 'src/stores/models/prescriptionDetails/PrescriptionDetail';

import db from 'src/stores/dexie';

const prescriptionDetailDexie = db[PrescriptionDetail.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('prescriptionDetail?offset=' + offset + '&max=100')
        .then((resp) => {
          prescriptionDetailDexie.bulkPut(resp.data);
          console.log('Data synced from backend: PrescriptionDetail');
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
