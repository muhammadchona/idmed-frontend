import { Model } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import { v4 as uuidv4 } from 'uuid';
export default class City extends Model {
  static entity = 'cities';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      description: this.attr(''),
      code: this.attr(''),
      province_id: this.attr(''),

      // Relationshiops
      provincia: this.belongsTo(Province, 'province_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
