import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupMemberPrescription from 'src/stores/models/group/GroupMemberPrescription';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import { useGroupMemberPrescription } from 'src/composables/group/groupMemberPrescriptionMethods';

const { isOnline, isMobile } = useSystemUtils();

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
    if (isOnline.value) {
      return await api()
        .get(`/groupMemberPrescription/member/${id}`)
        .then((resp) => {
          if (resp.data !== '') {
            groupMemberPrescription.save(resp.data);
          }
          return resp;
        });
    } else {
      return nSQL('groupMemberPrescriptions')
        .query('select')
        .where(['member.id', '=', id])
        .exec()
        .then((result) => {
          console.log('groupsssMember' + result);
          groupMemberPrescription.save(result);
        });
    }
  },

  async apiSave(groupMemberPrescriptionObject: any) {
    let resp = null;
    if (isOnline.value) {
      resp = await api().post(
        '/groupMemberPrescription',
        groupMemberPrescriptionObject
      );
      groupMemberPrescription.save(resp.data);
    } else {
      groupMemberPrescriptionObject.syncStatus = 'R';
      resp = await nSQL(GroupMemberPrescription.entity)
        .query('upsert', groupMemberPrescriptionObject)
        .exec();
      console.log(
        'criacaoPrescricaoMembroMobile' + groupMemberPrescriptionObject
      );
      groupMemberPrescription.save(groupMemberPrescriptionObject);
    }
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
  deleteFromStorageById(id: string) {
    return groupMemberPrescription.destroy(id);
  },
  deleteAllFromStorage() {
    groupMemberPrescription.flush();
  },
  getGroupMemberPrescriptionByMemberId(memberId: string) {
    const groupMemberPrescriptions = groupMemberPrescription
      .query()
      .with('prescription', (query) => {
        query.withAllRecursive(2);
      })
      .where('member_id', memberId)
      .get();
    const groupMemberPrescriptionObj =
      useGroupMemberPrescription().lastGroupMemberPrescription(
        groupMemberPrescriptions
      );
    return groupMemberPrescriptionObj;
  },
};
