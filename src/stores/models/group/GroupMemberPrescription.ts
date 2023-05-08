import { Model } from 'pinia-orm';
import GroupMember from '../groupMember/GroupMember';
import Prescription from '../prescription/Prescription';
import db from 'src/stores/localbase';
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

  static async apiFetchById(id) {
    return await this.api().get(`/groupMemberPrescription/${id}`);
  }

  static async apiFetchByMemberId(id) {
    return await this.api().get(`/groupMemberPrescription/member/${id}`);
  }

  static async apiSave(groupMemberPrescription) {
    return await this.api().post(
      '/groupMemberPrescription',
      groupMemberPrescription
    );
  }

  static async apiUpdate(groupMemberPrescription) {
    return await this.api().post(
      '/groupMemberPrescription',
      groupMemberPrescription
    );
  }

  static localDbAdd(groupMemberPrescription) {
    return db
      .newDb()
      .collection('groupMemberPrescriptions')
      .add(groupMemberPrescription);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('groupMemberPrescriptions')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('groupMemberPrescriptions').get();
  }

  static localDbUpdate(groupMemberPrescription) {
    return db
      .newDb()
      .collection('groupMemberPrescriptions')
      .doc({ id: groupMemberPrescription.id })
      .set(groupMemberPrescription);
  }

  static localDbUpdateAll(groupMemberPrescriptions) {
    return db
      .newDb()
      .collection('groupMemberPrescriptions')
      .set(groupMemberPrescriptions);
  }

  static localDbDelete(groupMemberPrescription) {
    return db
      .newDb()
      .collection('groupMemberPrescriptions')
      .doc({ id: groupMemberPrescription.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('groupMemberPrescriptions').delete();
  }
}
