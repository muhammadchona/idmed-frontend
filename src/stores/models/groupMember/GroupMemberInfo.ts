import { Model } from 'pinia-orm';

export default class GroupMemberInfo extends Model {
  static entity = 'GroupMemberInfos';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      lastPrescriptionDate: this.attr(''),
      lastPickupDate: this.attr(''),
      nextPickupDate: this.attr(''),
      NID: this.attr(''),
      fullName: this.attr(''),
      validade: this.attr(''),
      lastPrescriptionDateMember: this.attr(''),
      validadeNova: this.attr(''),
      groupId: this.attr(''),
      patientId: this.attr(''),
      patientServiceId: this.attr(''),
      episodeId: this.attr(''),
      groupMemberId: this.attr(''),
      membershipEndDate: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
