import { Model } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import { v4 as uuidv4 } from 'uuid';

export default class Country extends Model {
  static entity = 'countries';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      description: this.attr(''),
      nacionality: this.attr(''),
      code: this.attr(''),

      // Relationshiops
      provinces: this.hasMany(Province, 'country_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
