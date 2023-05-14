import { Model } from 'pinia-orm';
import { v4 as uuidv4 } from 'uuid';

export default class InteroperabilityType extends Model {
  static entity = 'interoperabilityTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
