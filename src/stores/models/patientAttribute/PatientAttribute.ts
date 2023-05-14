import { Model } from 'pinia-orm';
import AttributeType from '../attributeType/AttributeType';
import Patient from '../patient/Patient';
import { v4 as uuidv4 } from 'uuid';

export default class PatientAttribute extends Model {
  static entity = 'attributes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      attributeType_id: this.attr(''),
      value: this.attr(''),
      patient_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      patient: this.belongsTo(Patient, 'patient_id'),
      attributeType: this.belongsTo(AttributeType, 'attributeType_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
