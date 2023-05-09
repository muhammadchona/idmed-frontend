import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';

const prescriptionDetails = useRepo(PrescriptionDetails);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('prescriptionDetails', params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescriptionDetails?offset=' + offset + '&limit=100')
        .then((resp) => {
          prescriptionDetails.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('prescriptionDetails/' + id, params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('prescriptionDetails/' + id)
      .then(() => {
        prescriptionDetails.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescriptionDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescriptionDetails.all();
  },
};
