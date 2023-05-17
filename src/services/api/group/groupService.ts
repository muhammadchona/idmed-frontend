import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Group from 'src/stores/models/group/Group';

const group = useRepo(Group);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('group', params)
      .then((resp) => {
        group.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('group?offset=' + offset + '&max=100')
        .then((resp) => {
          group.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('group/' + id, params)
      .then((resp) => {
        group.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('group/' + id)
      .then(() => {
        group.destroy(id);
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/groupInfo/${id}`);
  },

  async apiSave(group: any) {
    return await api().post('/groupInfo', group);
  },

  async apiUpdate(group: any) {
    return await api().patch('/groupInfo/' + group.id, group);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/groupInfo/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiValidateBeforeAdd(patientId: string, code: string) {
    return await api().get(`/groupInfo/validadePatient/${patientId}/${code}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return group.getModel().$newInstance();
  },
  getAllFromStorage() {
    return group.all();
  },
};
