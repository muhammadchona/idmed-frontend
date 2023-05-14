import { Model } from 'pinia-orm';
import GroupMember from '../groupMember/GroupMember';
import Prescription from '../prescription/Prescription';
import { v4 as uuidv4 } from 'uuid';

export default class GroupMemberPrescription extends Model {
  static entity = 'groupMemberPrescriptions';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      prescription_id: this.attr(''),
      member_id: this.attr(''),
      used: this.boolean(false),
      syncStatus: this.attr(''),
      // Relationships
      member: this.belongsTo(GroupMember, 'member_id'),
      prescription: this.belongsTo(Prescription, 'prescription_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
