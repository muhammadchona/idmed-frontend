import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Group from '../group/Group';
import GroupMemberPrescription from '../group/GroupMemberPrescription';
import Patient from '../patient/Patient';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class GroupMember extends Model {
  static entity = 'members';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      startDate: this.attr(''),
      endDate: this.attr(null),
      group_id: this.attr(''),
      patient_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      group: this.belongsTo(Group, 'group_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      groupMemberPrescription: this.hasMany(
        GroupMemberPrescription,
        'member_id'
      ),
    };
  }

  isActive() {
    return this.endDate === null;
  }

  static async apiUpdate(member) {
    // return await this.api().post('/groupMember', member)
    return await this.api().patch('/groupMember/' + member.id, member);
  }

  static localDbAdd(member) {
    return db.newDb().collection('members').add(member);
  }

  static localDbGetById(id) {
    return db.newDb().collection('members').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('members').get();
  }

  static localDbUpdate(member) {
    return db.newDb().collection('members').doc({ id: member.id }).set(member);
  }

  static localDbUpdateAll(members) {
    return db.newDb().collection('members').set(members);
  }

  static localDbDelete(member) {
    return db.newDb().collection('members').doc({ id: member.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('members').delete();
  }
}
