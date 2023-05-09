import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('patientServiceIdentifier', params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&limit=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('patientServiceIdentifier/' + id, params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('patientServiceIdentifier/' + id)
      .then(() => {
        patientServiceIdentifier.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
};
