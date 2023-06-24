import { Model } from 'pinia-orm';
import ClinicalService from '../ClinicalService/ClinicalService';
import ClinicalServiceAttributeType from '../ClinicalServiceAttributeType/ClinicalServiceAttributeType';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicalServiceAttribute extends Model {
  static entity = 'clinicalServiceAttributes';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      service_id: this.attr(null),
      service_attr_type_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinicalService: this.belongsTo(ClinicalService, 'service_id'),
      clinicalServiceAttributeType: this.belongsTo(
        ClinicalServiceAttributeType,
        'service_attr_type_id'
      ),
    };

  }
  static piniaOptions = {
    persist: true,
  };
}
