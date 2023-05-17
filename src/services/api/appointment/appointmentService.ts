import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Appointment from 'src/stores/models/appointment/Appointment';

const appointment = useRepo(Appointment);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('appointment', params);
    appointment.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('appointment?offset=' + offset + '&max=100')
        .then((resp) => {
          appointment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('appointment/' + id, params);
    appointment.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('appointment/' + id);
    appointment.destroy(id);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return appointment.getModel().$newInstance();
  },
  getAllFromStorage() {
    return appointment.all();
  },
};
