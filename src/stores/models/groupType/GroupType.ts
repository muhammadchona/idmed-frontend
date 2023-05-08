import { Model } from 'pinia-orm';
import Group from '../group/Group';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class GroupType extends Model {
  static entity = 'groupTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      groups: this.hasMany(Group, 'groupType_id'),
    };
  }

  static async apiGetAll() {
    return await this.api().get('/groupType');
  }

  static localDbAdd(groupType) {
    return db.newDb().collection('groupTypes').add(groupType);
  }

  static localDbGetById(id) {
    return db.newDb().collection('groupTypes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('groupTypes').get();
  }

  static localDbUpdate(groupType) {
    return db
      .newDb()
      .collection('groupTypes')
      .doc({ id: groupType.id })
      .set(groupType);
  }

  static localDbUpdateAll(groupTypes) {
    return db.newDb().collection('groupTypes').set(groupTypes);
  }

  static localDbDelete(groupType) {
    return db
      .newDb()
      .collection('groupTypes')
      .doc({ id: groupType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('groupTypes').delete();
  }
}
