import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';

const spetialPrescriptionMotive = useRepo(SpetialPrescriptionMotive);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('spetialPrescriptionMotive', params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&limit=100')
        .then((resp) => {
          spetialPrescriptionMotive.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('spetialPrescriptionMotive/' + id, params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('spetialPrescriptionMotive/' + id)
      .then(() => {
        spetialPrescriptionMotive.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return spetialPrescriptionMotive.getModel().$newInstance();
  },
  getAllFromStorage() {
    return spetialPrescriptionMotive.all();
  },
};
