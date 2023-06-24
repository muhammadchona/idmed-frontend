import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import { v4 as uuidv4 } from 'uuid';

export default class Form extends Model {
  static entity = 'forms';
  static primaryKey = 'id';
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
}
