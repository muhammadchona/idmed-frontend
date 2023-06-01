import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';

const patientVisit = useRepo(PatientVisit);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientVisit', params);
    patientVisit.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientVisit?offset=' + offset + '&max=100')
        .then((resp) => {
          patientVisit.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: string, params: string) {
    const resp = await api().patch('patientVisit/' + id, params);
    patientVisit.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patientVisit/' + id);
    patientVisit.destroy(id);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientVisit/${id}`);
  },

  async apiSave(patientVisit: any) {
    return await api().post('/patientVisit', patientVisit);
  },

  async apiMySave(patientVisit: any) {
    return await api().post('/patientVisit/mySave', patientVisit);
  },

  async apiSaveRec(patientVisit: any) {
    return await api().post('/patientVisit/saveRecord', patientVisit);
  },

  async apiUpdate(patientVisit: any) {
    return await api().patch(`/patientVisit/${patientVisit.id}`, patientVisit);
  },

  async apiRemove(id: string) {
    return await api().delete(`/patientVisit/${id}`);
  },

  async apiGetAllByPatientId(patientId: string) {
    const resp = await api().get('/patientVisit/patient/' + patientId);
    patientVisit.save(resp.data);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisit/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastWithScreeningOfClinic(
    clinicId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/patientVisit/AllLastWithScreeningOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetLastVisitOfPatient(patientId: string) {
    return await api().get('/patientVisit/getLastVisitOfPatient/' + patientId);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisit.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisit.all();
  },

  getLastFourWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(2)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
  getAllWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(3)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
};
