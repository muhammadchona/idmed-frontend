import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const spetialPrescriptionMotive = useRepo(SpetialPrescriptionMotive);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('spetialPrescriptionMotive', params);
    spetialPrescriptionMotive.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&max=100')
        .then((resp) => {
          spetialPrescriptionMotive.save(resp.data);
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
    const resp = await api().patch('spetialPrescriptionMotive/' + id, params);
    spetialPrescriptionMotive.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('spetialPrescriptionMotive/' + id);
    spetialPrescriptionMotive.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/spetialPrescriptionMotive?offset=' + offset + '&max=' + max
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/spetialPrescriptionMotive/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return spetialPrescriptionMotive.getModel().$newInstance();
  },
  getAllFromStorage() {
    return spetialPrescriptionMotive.all();
  },
};
