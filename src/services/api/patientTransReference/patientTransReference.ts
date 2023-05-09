import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReference from 'src/stores/models/transreference/PatientTransReference';

const patientTransReference = useRepo(PatientTransReference);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('patientTransReference', params)
      .then((resp) => {
        patientTransReference.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReference?offset=' + offset + '&limit=100')
        .then((resp) => {
          patientTransReference.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('patientTransReference/' + id, params)
      .then((resp) => {
        patientTransReference.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('patientTransReference/' + id)
      .then(() => {
        patientTransReference.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReference.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReference.all();
  },
};
