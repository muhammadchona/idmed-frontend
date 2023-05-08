import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class StartStopReason extends Model {
  static entity = 'startStopReasons';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      isStartReason: this.boolean(false),
      reason: this.attr(''),
      episode: this.hasMany(Episode, 'startStopReason_id'),
      syncStatus: this.attr(''),
      code: this.attr(''),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/startStopReason?offset=' + offset + '&max=' + max
    );
  }

  static isTranferReason() {
    return this.code === 'TRANSFERIDO_PARA';
  }

  static async apiFetchById(id) {
    return await this.api().get(`/startStopReason/${id}`);
  }

  static localDbAdd(startStopReason) {
    return db.newDb().collection('startStopReasons').add(startStopReason);
  }

  static localDbGetById(id) {
    return db.newDb().collection('startStopReasons').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('startStopReasons').get();
  }

  static localDbUpdate(startStopReason) {
    return db
      .newDb()
      .collection('startStopReasons')
      .doc({ id: startStopReason.id })
      .set(startStopReason);
  }

  static localDbUpdateAll(startStopReasons) {
    return db.newDb().collection('startStopReasons').set(startStopReasons);
  }

  static localDbDelete(startStopReason) {
    return db
      .newDb()
      .collection('startStopReasons')
      .doc({ id: startStopReason.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('startStopReasons').delete();
  }
}
