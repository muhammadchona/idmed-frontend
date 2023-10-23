import { Model } from 'pinia-orm';
import PostoAdministrativo from '../PostoAdministrativo/PostoAdministrativo';
import District from '../district/District';
import { v4 as uuidv4 } from 'uuid';

export default class Localidade extends Model {
  static entity = 'localidades';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      postoAdministrativo_id: this.attr(''),
      district_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      postoAdministrativo: this.belongsTo(
        PostoAdministrativo,
        'postoAdministrativo_id'
      ),
      district: this.belongsTo(District, 'district_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
