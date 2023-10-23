import { Model } from 'pinia-orm';
import ClinicalServiceAttribute from '../ClinicalServiceAttribute/ClinicalServiceAttribute';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicalServiceAttributeType extends Model {
  static entity = 'clinicalServiceAttributeTypes';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),

      clinicalServiceAttributes: this.hasMany(
        ClinicalServiceAttribute,
        'service_attr_type_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
