import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import HealthInformationSystem from 'src/stores/models/healthInformationSystem/HealthInformationSystem';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const healthInformationSystem = useRepo(HealthInformationSystem);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('healthInformationSystem', params);
    healthInformationSystem.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('healthInformationSystem?offset=' + offset + '&max=100')
        .then((resp) => {
          healthInformationSystem.save(resp.data);
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
    const resp = await api().patch('healthInformationSystem/' + id, params);
    healthInformationSystem.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('healthInformationSystem/' + id);
    healthInformationSystem.destroy(id);
  },

  async apiFetchById(id: string) {
    return await api().get(`/healthInformationSystem/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/healthInformationSystem?offset=' + offset + '&max=' + max
    );
  },

  async apiSave(his: any) {
    return await api().post('/healthInformationSystem', his);
  },

  async apiUpdate(his: any) {
    return await api().patch('/healthInformationSystem/' + his.id, his);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return healthInformationSystem.getModel().$newInstance();
  },
  localSave(healtSystem: any) {
    healthInformationSystem.save(healtSystem);
  },
  getAllFromStorage() {
    return healthInformationSystem.all();
  },
  getAllActive() {
    return healthInformationSystem
      .with('interoperabilityAttributes')
      .where('active', true)
      .get();
  },
};
