import { Model } from 'pinia-orm';
import District from '../district/District';
import Localidade from '../Localidade/Localidade';
import { v4 as uuidv4 } from 'uuid';

export default class PostoAdministrativo extends Model {
  static entity = 'postoAdministrativos';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      district_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      district: this.belongsTo(District, 'district_id'),
      localidades: this.hasMany(Localidade, 'postoAdministrativo_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };

}
