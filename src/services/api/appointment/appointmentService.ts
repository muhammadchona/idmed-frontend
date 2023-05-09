import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Appointment from 'src/stores/models/appointment/Appointment';

const appointment = useRepo(Appointment);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('appointment', params)
      .then((resp) => {
        appointment.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('appointment?offset=' + offset + '&limit=100')
        .then((resp) => {
          appointment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('appointment/' + id, params)
      .then((resp) => {
        appointment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('appointment/' + id)
      .then(() => {
        appointment.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return appointment.getModel().$newInstance();
  },
  getAllFromStorage() {
    return appointment.all();
  },
};
