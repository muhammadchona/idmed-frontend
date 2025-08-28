import api from '../../api/apiService/apiService';
import clinicalServiceAttributeService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService';

import db from 'src/stores/dexie';
import ClinicalServiceAttributeType from 'src/stores/models/ClinicalServiceAttributeType/ClinicalServiceAttributeType';

const clinicalServiceAttributeDexie = db[ClinicalServiceAttributeType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicalServiceAttributeType?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalServiceAttributeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: clinicalServiceAttributeType');
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
