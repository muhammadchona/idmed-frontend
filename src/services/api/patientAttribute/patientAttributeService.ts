import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientAttribute from 'src/stores/models/patientAttribute/PatientAttribute';

const patientAttribute = useRepo(PatientAttribute);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('patientAttribute', params)
      .then((resp) => {
        patientAttribute.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          patientAttribute.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('patientAttribute/' + id, params)
      .then((resp) => {
        patientAttribute.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('patientAttribute/' + id)
      .then(() => {
        patientAttribute.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientAttribute.all();
  },
};
