import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientServiceIdentifier', params);
    patientServiceIdentifier.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patientServiceIdentifier/' + id, params);
    patientServiceIdentifier.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patientServiceIdentifier/' + id);
    patientServiceIdentifier.destroy(id);
  },

  async apiSave(identifier: string, isNew: boolean) {
    if (isNew) {
      return await api().post('/patientServiceIdentifier', identifier);
    } else {
      return this.apiUpdate(identifier);
    }
  },

  async apiUpdate(identifier: any) {
    return await api().patch(
      '/patientServiceIdentifier/' + identifier.id,
      identifier
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientServiceIdentifier/${id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientServiceIdentifier/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllByPatientId(patientId: string, offset: number, max: number) {
    return await api().get(
      '/patientServiceIdentifier/patient/' +
        patientId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.apiSave(identifier, true);
    if (identifier.syncStatus === 'U') await this.apiUpdate(identifier);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  curIdentifier(id: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .where('value', id)
      .first();
  },
};
