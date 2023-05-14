import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Group from '../group/Group';
import GroupMemberPrescription from '../group/GroupMemberPrescription';
import Patient from '../patient/Patient';
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
  static piniaOptions = {
    persist: true,
  };
}
