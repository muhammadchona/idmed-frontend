import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReferenceType from 'src/stores/models/transreference/PatientTransReferenceType';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const patientTransReferenceType = useRepo(PatientTransReferenceType);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientTransReferenceType', params);
    patientTransReferenceType.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReferenceType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patientTransReferenceType/' + id, params);
    patientTransReferenceType.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patientTransReferenceType/' + id);
    patientTransReferenceType.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReferenceType?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReferenceType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReferenceType.all();
  },
};
