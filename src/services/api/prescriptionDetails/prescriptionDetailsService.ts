import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';

const prescriptionDetails = useRepo(PrescriptionDetails);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('prescriptionDetails', params);
    prescriptionDetails.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescriptionDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          prescriptionDetails.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('prescriptionDetails/' + id, params);
    prescriptionDetails.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('prescriptionDetails/' + id);
    prescriptionDetails.destroy(id);
  },

  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api().get(
      '/prescriptionDetail/prescription/' + prescriptionId
    );
  },

  async apiGetAll() {
    return await api().get('/prescriptionDetail?offset=' + 0 + '&max=' + 200);
  },

  async apiFetchById(id: string) {
    return await api().get(`/prescriptionDetail/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return prescriptionDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescriptionDetails.all();
  },
};
