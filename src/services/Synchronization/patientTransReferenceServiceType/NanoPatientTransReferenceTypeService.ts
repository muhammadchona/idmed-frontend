import api from '../../api/apiService/apiService';
import PatientTransReferenceTypeService from 'src/services/api/patientTransReferenceServiceType/PatientTransReferenceTypeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          PatientTransReferenceTypeService.addBulkMobile(resp.data);
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
};
