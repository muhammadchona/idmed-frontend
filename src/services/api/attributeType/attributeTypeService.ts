import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import AttributeType from 'src/stores/models/attributeType/AttributeType';

const attributeType = useRepo(AttributeType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('attributeType', params)
      .then((resp) => {
        attributeType.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('attributeType?offset=' + offset + '&max=100')
        .then((resp) => {
          attributeType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('attributeType/' + id, params)
      .then((resp) => {
        attributeType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('attributeType/' + id)
      .then(() => {
        attributeType.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return attributeType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return attributeType.all();
  },
};
