import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Prescription from 'src/stores/models/prescription/Prescription';

const prescription = useRepo(Prescription);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('prescription', params)
      .then((resp) => {
        prescription.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescription?offset=' + offset + '&limit=100')
        .then((resp) => {
          prescription.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('prescription/' + id, params)
      .then((resp) => {
        prescription.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('prescription/' + id)
      .then(() => {
        prescription.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescription.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescription.all();
  },
};
