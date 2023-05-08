import { Model } from 'pinia-orm';
import Pack from '../packaging/Pack';
import GroupPackHeader from './GroupPackHeader';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class GroupPack extends Model {
  static entity = 'groupPacks';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      pack_id: this.attr(''),
      header_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      pack: this.belongsTo(Pack, 'pack_id'),
      header: this.belongsTo(GroupPackHeader, 'header_id'),
    };
  }

  static async apiFetchById(id) {
    return await this.api().get(`/groupPack/${id}`);
  }

  static async apiSave(groupPack) {
    return await this.api().post('/groupPack', groupPack);
  }

  static async apiUpdate(groupPack) {
    return await this.api().post('/groupPack', groupPack);
  }

  static localDbAdd(groupPack) {
    return db.newDb().collection('groupPacks').add(groupPack);
  }

  static localDbGetById(id) {
    return db.newDb().collection('groupPacks').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('groupPacks').get();
  }

  static localDbUpdate(groupPack) {
    return db
      .newDb()
      .collection('groupPacks')
      .doc({ id: groupPack.id })
      .set(groupPack);
  }

  static localDbUpdateAll(groupPacks) {
    return db.newDb().collection('groupPacks').set(groupPacks);
  }

  static localDbDelete(groupPack) {
    return db
      .newDb()
      .collection('groupPacks')
      .doc({ id: groupPack.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('groupPacks').delete();
  }
}
