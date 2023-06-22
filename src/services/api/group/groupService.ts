import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Group from 'src/stores/models/group/Group';
import { useSwal } from 'src/composables/shared/dialog/dialog';

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
    return await api()
      .get(`/groupInfo/${id}`)
      .then((resp) => {
        group.save(resp.data);
        return resp;
      });
  },

  async apiSave(groupInfo: any) {
    /*
    await api()
      .post('/groupInfo', groupInfo)
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
        return listErrors;
      });
      */
    const resp = await api().post('/groupInfo', groupInfo);
    group.save(resp.data);
    return resp;
  },

  async apiUpdate(groupInfo: any) {
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
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
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
  },

  async apiValidateBeforeAdd(patientId: string, code: string) {
    return await api().get(`/groupInfo/validadePatient/${patientId}/${code}`);
  },
  getAllGroups() {
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
