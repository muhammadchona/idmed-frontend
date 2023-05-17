import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UserClinicSectors from 'src/stores/models/userLogin/UserClinicSector';

const userClinicSector = useRepo(UserClinicSectors);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('userClinicSector', params);
    userClinicSector.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('userClinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          userClinicSector.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('userClinicSector/' + id, params);
    userClinicSector.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('userClinicSector/' + id);
    userClinicSector.destroy(id);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return userClinicSector.getModel().$newInstance();
  },
  getAllFromStorage() {
    return userClinicSector.all();
  },
};
