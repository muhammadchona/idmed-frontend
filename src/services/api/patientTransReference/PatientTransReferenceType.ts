import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReferenceType from 'src/stores/models/patientTransReferenceType/PatientTransReferenceType';

const patientTransReferenceType = useRepo(PatientTransReferenceType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('patientTransReferenceType', params)
      .then((resp) => {
        patientTransReferenceType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReferenceType?offset=' + offset + '&limit=100')
        .then((resp) => {
          patientTransReferenceType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('patientTransReferenceType/' + id, params)
      .then((resp) => {
        patientTransReferenceType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('patientTransReferenceType/' + id)
      .then(() => {
        patientTransReferenceType.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReferenceType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReferenceType.all();
  },
};
