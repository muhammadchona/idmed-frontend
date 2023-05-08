import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class DispenseType extends Model {
  static entity = 'dispenseTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      syncStatus: this.attr(''),
      description: this.attr(''),
    };
  }

  isDS() {
    return this.code === 'DS';
  }

  isDM() {
    return this.code === 'DM';
  }

  isDT() {
    return this.code === 'DT';
  }

  isDA() {
    return this.code === 'DA';
  }

  getRelatedWeeks() {
    if (this.isDM()) {
      return 4;
    } else if (this.isDT()) {
      return 12;
    } else if (this.isDS()) {
      return 24;
    } else if (this.isDA()) {
      return 52;
    }
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/dispenseType?offset=0&max=100');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/dispenseType/${id}`);
  }

  static localDbAdd(dispenseType) {
    return db.newDb().collection('dispenseTypes').add(dispenseType);
  }

  static localDbGetById(id) {
    return db.newDb().collection('dispenseTypes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('dispenseTypes').get();
  }

  static localDbUpdate(dispenseType) {
    return db
      .newDb()
      .collection('dispenseTypes')
      .doc({ id: dispenseType.id })
      .set(dispenseType);
  }

  static localDbUpdateAll(dispenseTypes) {
    return db.newDb().collection('dispenseTypes').set(dispenseTypes);
  }

  static localDbDelete(dispenseType) {
    return db
      .newDb()
      .collection('dispenseTypes')
      .doc({ id: dispenseType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('dispenseTypes').delete();
  }
}
