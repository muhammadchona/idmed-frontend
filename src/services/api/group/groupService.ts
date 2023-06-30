import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Group from 'src/stores/models/group/Group';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const { website, isDeskTop, isMobile } = useSystemUtils();
const { alertSucess, alertError, alertInfo } = useSwal();

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
      if (isMobile.value) {
        return api()
          .get('group?offset=' + offset + '&max=100')
          .then((resp) => {
            group.save(resp.data);
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
            }
          });
      } else {
        return nSQL('groups')
          .query('select')
          .exec()
          .then((result) => {
            console.log('groups' + result);
            group.save(result);
          });
      }
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
    return await api()
      .get(`/groupInfo/${id}`)
      .then((resp) => {
        group.save(resp.data);
        return resp;
      });
  },

  async apiSave(groupInfo: any) {
    let resp = null;
    if (isMobile.value) {
      groupInfo.syncStatus = 'R';
      resp = await nSQL('groups').query('upsert', groupInfo).exec();
      console.log('criacaoGrupo' + groupInfo);
      group.save(groupInfo);
    } else {
      resp = await api().post('/groupInfo', groupInfo);
      group.save(resp.data);
    }
    return resp;
  },

  async apiUpdate(groupInfo: any) {
    if (isMobile.value) {
      if (groupInfo.syncStatus !== 'R') groupInfo.syncStatus = 'U';
      const resp = await nSQL('groups').query('upsert', groupInfo).exec();
      console.log('edicaoGrupo' + groupInfo);
      group.save(resp);
    } else {
      return await api()
        .patch('/groupInfo/' + groupInfo.id, groupInfo)
        .then((resp) => {
          group.save(resp.data);
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
    }
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    // console.log('teste');
    //  group.flush();
    if (isMobile.value) {
      return nSQL('groups')
        .query('select')
        .exec()
        .then((result) => {
          console.log('groupsss' + result);
          group.save(result);
        });
    } else {
      return await api()
        .get(
          '/groupInfo/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
        )
        .then((resp) => {
          group.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.apiGetAllByClinicId(clinicId, offset, max);
          }
        });
    }
  },

  async apiValidateBeforeAdd(patientId: string, code: string) {
    return await api().get(`/groupInfo/validadePatient/${patientId}/${code}`);
  },
  getAllGroups() {
    console.log(group.query().with('groupType').with('service').get());
    return group.query().with('groupType').with('service').get();
  },

  getGroupById(groupId: string) {
    return group.withAllRecursive(3).where('id', groupId).first();
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return group.getModel().$newInstance();
  },
  getAllFromStorage() {
    return group.all();
  },

  getGroupWithsById(groupId: string) {
    return group
      .with('members', (query) => {
        query.withAllRecursive(1);
      })
      .with('service', (query) => {
        query.with('identifierType');
      })
      .with('groupType')
      .with('clinic', (query) => {
        query.withAllRecursive(1);
      })
      .with('packHeaders', (query) => {
        query.withAllRecursive(1);
      })
      .where('id', groupId)
      .first();
  },
};
