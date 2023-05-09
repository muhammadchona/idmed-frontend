import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';

const prescribedDrug = useRepo(PrescribedDrug);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('prescribedDrug', params)
      .then((resp) => {
        prescribedDrug.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescribedDrug?offset=' + offset + '&limit=100')
        .then((resp) => {
          prescribedDrug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('prescribedDrug/' + id, params)
      .then((resp) => {
        prescribedDrug.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('prescribedDrug/' + id)
      .then(() => {
        prescribedDrug.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescribedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescribedDrug.all();
  },
};
