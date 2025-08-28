import api from '../../api/apiService/apiService';
import clinicalServiceAttributeService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService';
import ClinicalServiceAttribute from 'src/stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const clinicalServiceAttributeDexie = db[ClinicalServiceAttribute.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicalServiceAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalServiceAttributeDexie.bulkPut(resp.data);
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

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania ClinicalServiceAttribute');
    (await SynchronizationService.hasData(clinicalServiceAttributeDexie))
      ? await clinicalServiceAttributeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie ClinicalServiceAttribute');
    const getAllClinicalServiceAttribute =
      clinicalServiceAttributeService.getAllClinicalServiceAttributes();
    await clinicalServiceAttributeDexie.bulkPut(getAllClinicalServiceAttribute);
  },
};
