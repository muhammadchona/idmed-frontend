import { Model } from 'pinia-orm';
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
  static piniaOptions = {
    persist: true,
  };
}
