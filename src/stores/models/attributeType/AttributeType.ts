import { Model } from 'pinia-orm';
import { v4 as uuidv4 } from 'uuid';

export default class AttributeType extends Model {
  static entity = 'attributeTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      name: this.attr(''),
      description: this.attr(''),
      datatype: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
