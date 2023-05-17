import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupMemberPrescription from 'src/stores/models/group/GroupMemberPrescription';

const groupMemberPrescription = useRepo(GroupMemberPrescription);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupMemberPrescription', params)
      .then((resp) => {
        groupMemberPrescription.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupMemberPrescription?offset=' + offset + '&max=100')
        .then((resp) => {
          groupMemberPrescription.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupMemberPrescription/' + id, params)
      .then((resp) => {
        groupMemberPrescription.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupMemberPrescription/' + id)
      .then(() => {
        groupMemberPrescription.destroy(id);
      });
  },

  async apiFetchById(id: string) {
    return await api().get(`/groupMemberPrescription/${id}`);
  },

  async apiFetchByMemberId(id: string) {
    return await api().get(`/groupMemberPrescription/member/${id}`);
  },

  async apiSave(groupMemberPrescription: any) {
    return await api().post(
      '/groupMemberPrescription',
      groupMemberPrescription
    );
  },

  async apiUpdate(groupMemberPrescription: any) {
    return await api().post(
      '/groupMemberPrescription',
      groupMemberPrescription
    );
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return groupMemberPrescription.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupMemberPrescription.all();
  },
};
