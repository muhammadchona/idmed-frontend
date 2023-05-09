import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';

const patient = useRepo(Patient);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('patient', params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patient?offset=' + offset + '&limit=100')
        .then((resp) => {
          patient.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('patient/' + id, params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('patient/' + id)
      .then(() => {
        patient.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patient.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patient.all();
  },
};
