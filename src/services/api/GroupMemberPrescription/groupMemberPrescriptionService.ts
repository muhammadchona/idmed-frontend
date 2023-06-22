import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupMemberPrescription from 'src/stores/models/group/GroupMemberPrescription';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { alertSucess, alertError, alertInfo } = useSwal();
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
    return await api()
      .get(`/groupMemberPrescription/member/${id}`)
      .then((resp) => {
        if (resp.data !== '') {
          groupMemberPrescription.save(resp.data);
        }
        return resp;
      });
  },

  async apiSave(groupMemberPrescriptionObject: any) {
    /*
    return await api()
      .post('/groupMemberPrescription', groupMemberPrescriptionObject)
      .then((resp) => {
        groupMemberPrescription.save(resp.data);
        return resp.data;
      })
      .catch((error) => {
        const listErrors = [];
        if (error.request.response != null) {
          const arrayErrors = JSON.parse(error.request.response);
          if (arrayErrors.total == null) {
            listErrors.push(arrayErrors.message);
          } else {
            arrayErrors._embedded.errors.forEach((element) => {
              listErrors.push(element.message);
            });
          }
        }
        alertError(listErrors.value);
      });
      */
    const resp = await api().post(
      '/groupMemberPrescription',
      groupMemberPrescriptionObject
    );
    groupMemberPrescription.save(resp.data);
    return resp;
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

  getGroupMemberPrescriptionByMemberId(memberId: string) {
    return groupMemberPrescription
      .query()
      .with('prescription', (query) => {
        query.withAllRecursive(2);
      })
      .where('member_id', memberId)
      .first();
  },
};
