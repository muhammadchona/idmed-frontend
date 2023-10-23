import { Model } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import Localidade from '../Localidade/Localidade';
import PostoAdministrativo from '../PostoAdministrativo/PostoAdministrativo';
import { v4 as uuidv4 } from 'uuid';

export default class District extends Model {
  static entity = 'districts';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      province_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      province: this.belongsTo(Province, 'province_id'),
      postosAdministrativos: this.hasMany(PostoAdministrativo, 'district_id'),
      localidades: this.hasMany(Localidade, 'district_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
