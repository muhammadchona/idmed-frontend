import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupPackHeader from 'src/stores/models/group/GroupPackHeader';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import patientVisitService from '../patientVisit/patientVisitService';

const groupPackHeader = useRepo(GroupPackHeader);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupPackHeader', params)
      .then((resp) => {
        groupPackHeader.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupPackHeader?offset=' + offset + '&max=100')
        .then((resp) => {
          groupPackHeader.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupPackHeader/' + id, params)
      .then((resp) => {
        groupPackHeader.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupPackHeader/' + id)
      .then(() => {
        groupPackHeader.destroy(id);
      });
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/groupPackHeader/${id}`)
      .then((resp) => {
        groupPackHeader.save(resp.data);
        return resp;
      });
  },

  async apiSave(groupPackHeaderParam: any) {
    return await api()
      .post('/groupPackHeader', groupPackHeaderParam)
      .then((resp) => {
        groupPackHeaderParam.groupPacks.forEach(groupPack => {
          /*
          groupPack.patientVisit.patientVisitDetails.forEach(pvd => {
            patientVisitDetailsService.saveInStorage(pvd)
          });
          */
         patientVisitService.saveInStorage(groupPack.patientVisit)
        })
        // groupPackHeader.save(groupPackHeaderParam);
        return resp;
      });
  },

  async apiUpdate(groupPackHeader: any) {
    return await api().post('/groupPackHeader', groupPackHeader);
  },

  async apiDelete(groupPackHeader: any) {
    return await api().delete(`/groupPackHeader/${groupPackHeader.id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return groupPackHeader.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupPackHeader.all();
  },

  getGroupPackHeaderByGroupId(groupId: string) {
    return groupPackHeader
      .query()
      .withAllRecursive(3)
      .where('group_id', groupId)
      .orderBy('packDate', 'desc')
      .get();
  },
};
