import { Model } from 'pinia-orm';
import PatientTransReferenceType from './PatientTransReferenceType';
import { Clinic } from '../clinic/ClinicHierarchy';
import Patient from '../patient/Patient';
import PatientServiceIdentifier from '../patientServiceIdentifier/PatientServiceIdentifier';
import { v4 as uuidv4 } from 'uuid';

export default class PatientTransReference extends Model {
  static entity = 'patientTransReferences';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      operationDate: this.attr(''),
      creationDate: this.attr(''),
      patientTransReferenceTypeId: this.attr(''),
      originId: this.attr(''),
      destination: this.attr(''),
      identifierId: this.attr(''),
      patientId: this.attr(''),
      matchId: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      operationType: this.belongsTo(
        PatientTransReferenceType,
        'patientTransReferenceTypeId'
      ),
      origin: this.belongsTo(Clinic, 'originId'),
      identifier: this.belongsTo(PatientServiceIdentifier, 'identifierId'),
      patient: this.belongsTo(Patient, 'patientId'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
