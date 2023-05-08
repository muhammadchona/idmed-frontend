import { Model } from 'pinia-orm';
import GroupMember from '../groupMember/GroupMember';
import GroupType from '../groupType/GroupType';
import ClinicalService from '../ClinicalService/ClinicalService';
import Clinic from '../clinic/Clinic';
import GroupPackHeader from './GroupPackHeader';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Group extends Model {
  static entity = 'groups';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      name: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(null),
      groupType_id: this.attr(''),
      clinical_service_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      groupType: this.belongsTo(GroupType, 'groupType_id'),
      members: this.hasMany(GroupMember, 'group_id'),
      service: this.belongsTo(ClinicalService, 'clinical_service_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      packHeaders: this.hasMany(GroupPackHeader, 'group_id'),
    };
  }

  isDesintegrated() {
    return this.endDate !== null;
  }

  static async apiFetchById(id) {
    return await this.api().get(`/groupInfo/${id}`);
  }

  static async apiSave(group) {
    return await this.api().post('/groupInfo', group);
  }

  static async apiUpdate(group) {
    // return await this.api().post('/groupInfo', group)
    return await this.api().patch('/groupInfo/' + group.id, group);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/groupInfo/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiValidateBeforeAdd(patientId, code) {
    return await this.api().get(
      `/groupInfo/validadePatient/${patientId}/${code}`
    );
  }

  static localDbAdd(group) {
    return db.newDb().collection('groups').add(group);
  }

  static localDbGetById(id) {
    return db.newDb().collection('groups').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('groups').get();
  }

  static localDbUpdate(group) {
    return db.newDb().collection('groups').doc({ id: group.id }).set(group);
  }

  static localDbUpdateAll(groups) {
    return db.newDb().collection('groups').set(groups);
  }

  static localDbDelete(group) {
    return db.newDb().collection('groups').doc({ id: group.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('groups').delete();
  }
}
