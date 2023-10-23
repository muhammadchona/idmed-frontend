import { Model } from 'pinia-orm';
import { v4 as uuidv4 } from 'uuid';

export default class IdentifierType extends Model {
  static entity = 'identifierTypes';
  static primaryKey = 'id';
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
}
