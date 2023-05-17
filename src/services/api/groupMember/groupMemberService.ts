import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupMember from 'src/stores/models/groupMember/GroupMember';

const groupMember = useRepo(GroupMember);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupMember', params)
      .then((resp) => {
        groupMember.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupMember?offset=' + offset + '&max=100')
        .then((resp) => {
          groupMember.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupMember/' + id, params)
      .then((resp) => {
        groupMember.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupMember/' + id)
      .then(() => {
        groupMember.destroy(id);
      });
  },
  async apiUpdate(member: any) {
    return await api().patch('/groupMember/' + member.id, member);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return groupMember.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupMember.all();
  },
};
