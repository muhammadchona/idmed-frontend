import { Model } from 'pinia-orm';
import PatientTransReference from './PatientTransReference';
import { v4 as uuidv4 } from 'uuid';

export default class PatientTransReferenceType extends Model {
  static entity = 'patientTransReferenceTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      patientTransReferences: this.hasMany(
        PatientTransReference,
        'patientTransReferenceTypeId'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
