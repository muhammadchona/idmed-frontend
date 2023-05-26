import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class IdentifierType extends Model {
  static entity = 'identifierTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      syncStatus: this.attr(''),
      code: this.attr(''),
      description: this.attr(''),
      pattern: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/identifierType?offset=' + offset + '&max=' + max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/identifierType/${id}`);
  }

  static async apiSave(identifierType) {
    return await this.api().post('/identifierType', identifierType);
  }

  static async apiUpdate(identifierType) {
    return await this.api().patch(
      '/identifierType/' + identifierType.id,
      identifierType
    );
  }

  static localDbAdd(identifierType) {
    return db.newDb().collection('identifierTypes').add(identifierType);
  }

  static localDbGetById(id) {
    return db.newDb().collection('identifierTypes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('identifierTypes').get();
  }

  static localDbUpdate(identifierType) {
    return db
      .newDb()
      .collection('identifierTypes')
      .doc({ id: identifierType.id })
      .set(identifierType);
  }

  static localDbUpdateAll(identifierTypes) {
    return db.newDb().collection('identifierTypes').set(identifierTypes);
  }

  static localDbDelete(identifierType) {
    return db
      .newDb()
      .collection('identifierTypes')
      .doc({ id: identifierType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('identifierTypes').delete();
  }
}
