import { Model } from 'pinia-orm';
import ClinicalService from '../ClinicalService/ClinicalService';
import ClinicalServiceAttributeType from '../ClinicalServiceAttributeType/ClinicalServiceAttributeType';

export default class ClinicalServiceAttribute extends Model {
  static entity = 'clinicalServiceAttributes';
  static primaryKey = ['clinical_service_id', 'service_attr_type_id'];
  static fields() {
    return {
      clinical_service_id: this.attr(null),
      service_attr_type_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinicalService: this.belongsTo(ClinicalService, 'clinical_service_id'),
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
