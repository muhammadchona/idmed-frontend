import api from '../../api/apiService/apiService';
import PatientTransReferenceTypeService from 'src/services/api/patientTransReferenceServiceType/PatientTransReferenceTypeService';
import SynchronizationService from '../SynchronizationService';
import PatientTransReferenceType from 'src/stores/models/transreference/PatientTransReferenceType';
import db from 'src/stores/dexie';

const PatientTransReferenceTypeDexie = db[PatientTransReferenceType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          PatientTransReferenceTypeDexie.bulkPut(resp.data);
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

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania PatientTransReferenceType');
    (await SynchronizationService.hasData(PatientTransReferenceTypeDexie))
      ? await PatientTransReferenceTypeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie PatientTransReferenceType');
    const getAllPatientTransReferenceType =
      PatientTransReferenceTypeService.getAllFromStorage();
    await PatientTransReferenceTypeDexie.bulkPut(
      getAllPatientTransReferenceType
    );
  },
};
