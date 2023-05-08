import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class DispenseMode extends Model {
  static entity = 'dispenseModes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      openmrsUuid: this.attr(''),
    };
  }

  static async apiGetAll() {
    return await this.api().get('/dispenseMode');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/dispenseMode/${id}`);
  }

  static localDbAdd(dispenseMode) {
    return db.newDb().collection('dispenseModes').add(dispenseMode);
  }

  static localDbGetById(id) {
    return db.newDb().collection('dispenseModes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('dispenseModes').get();
  }

  static localDbUpdate(dispenseMode) {
    return db
      .newDb()
      .collection('dispenseModes')
      .doc({ id: dispenseMode.id })
      .set(dispenseMode);
  }

  static localDbUpdateAll(dispenseModes) {
    return db.newDb().collection('dispenseModes').set(dispenseModes);
  }

  static localDbDelete(dispenseMode) {
    return db
      .newDb()
      .collection('dispenseModes')
      .doc({ id: dispenseMode.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('dispenseModes').delete();
  }
}
