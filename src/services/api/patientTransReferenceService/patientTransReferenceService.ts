import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReference from 'src/stores/models/transreference/PatientTransReference';

const patientTransReference = useRepo(PatientTransReference);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientTransReference', params);
    patientTransReference.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReference?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReference.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patientTransReference/' + id, params);
    patientTransReference.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patientTransReference/' + id);
    patientTransReference.destroy(id);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReference?offset=' + offset + '&max=' + max
    );
  },

  async apiSave(transReference: any) {
    return await api().post('/patientTransReference', transReference);
  },

  async apiRemove(transReference: any) {
    return await api().delete(`/patientTransReference/${transReference.id}`);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientTransReference/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReference.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReference.all();
  },
};
