import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UserClinicSectors from 'src/stores/models/userLogin/UserClinicSector';

const userClinicSector = useRepo(UserClinicSectors);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('userClinicSector', params)
      .then((resp) => {
        userClinicSector.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('userClinicSector?offset=' + offset + '&limit=100')
        .then((resp) => {
          userClinicSector.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('userClinicSector/' + id, params)
      .then((resp) => {
        userClinicSector.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('userClinicSector/' + id)
      .then(() => {
        userClinicSector.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return userClinicSector.getModel().$newInstance();
  },
  getAllFromStorage() {
    return userClinicSector.all();
  },
};
