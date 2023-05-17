import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Prescription from 'src/stores/models/prescription/Prescription';

const prescription = useRepo(Prescription);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('prescription', params);
    prescription.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescription?offset=' + offset + '&max=100')
        .then((resp) => {
          prescription.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('prescription/' + id, params);
    prescription.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('prescription/' + id);
    prescription.destroy(id);
  },

  async apiSave(prescription: any) {
    return await api().post('/prescription', prescription);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/prescription/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/prescription/AllLastOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/prescription/${id}`);
  },

  async apiFetchLastByIdentifierId(id: string) {
    return await api().get(`/prescription/identifier/${id}`);
  },

  async apiFetchByPatientVisitDetailsId(
    pvdsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/prescription/visits/' + pvdsId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetByClinicId(clinicId: string) {
    return await api().get('/prescription/clinic/' + clinicId);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescription.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescription.all();
  },
};
