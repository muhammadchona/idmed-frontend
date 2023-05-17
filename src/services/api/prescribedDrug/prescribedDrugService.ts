import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';

const prescribedDrug = useRepo(PrescribedDrug);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('prescribedDrug', params);
    prescribedDrug.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescribedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          prescribedDrug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('prescribedDrug/' + id, params);
    prescribedDrug.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('prescribedDrug/' + id);
    prescribedDrug.destroy(id);
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api().get('/prescribedDrug/prescription/' + prescriptionId);
  },

  async apiGetAll() {
    return await api().get('/prescribedDrug?offset=' + 0 + '&max=' + 200);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescribedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescribedDrug.all();
  },
};
