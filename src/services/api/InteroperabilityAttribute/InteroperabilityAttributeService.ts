import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';

const interoperabilityAttribute = useRepo(InteroperabilityAttribute);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('interoperabilityAttribute', params)
      .then((resp) => {
        interoperabilityAttribute.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityAttribute?offset=' + offset + '&limit=100')
        .then((resp) => {
          interoperabilityAttribute.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('interoperabilityAttribute/' + id, params)
      .then((resp) => {
        interoperabilityAttribute.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('interoperabilityAttribute/' + id)
      .then(() => {
        interoperabilityAttribute.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityAttribute.all();
  },
};
