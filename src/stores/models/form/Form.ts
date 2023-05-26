import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Form extends Model {
  static entity = 'forms';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),

      // Relationships
      drugs: this.hasMany(Drug, 'form_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll(offset, max) {
    return await this.api().get('/form?offset=' + offset + '&max=' + max);
  }

  static async apiFetchById(id) {
    return await this.api().get(`/form/${id}`);
  }

  static localDbAdd(form) {
    return db.newDb().collection('forms').add(form);
  }

  static localDbGetById(id) {
    return db.newDb().collection('forms').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('forms').get();
  }

  static localDbUpdate(form) {
    return db.newDb().collection('forms').doc({ id: form.id }).set(form);
  }

  static localDbUpdateAll(forms) {
    return db.newDb().collection('forms').set(forms);
  }

  static localDbDelete(form) {
    return db.newDb().collection('forms').doc({ id: form.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('forms').delete();
  }
}
