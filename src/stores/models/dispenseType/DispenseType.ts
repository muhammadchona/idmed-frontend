import { Model } from 'pinia-orm';
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
  static piniaOptions = {
    persist: true,
  };
}
