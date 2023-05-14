import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import IdentifierType from '../identifierType/IdentifierType';
import Patient from '../patient/Patient';
import ClinicalService from '../ClinicalService/ClinicalService';
import Clinic from '../clinic/Clinic';
import { v4 as uuidv4 } from 'uuid';

export default class PatientServiceIdentifier extends Model {
  static entity = 'identifiers';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      startDate: this.attr(''),
      endDate: this.attr(''),
      reopenDate: this.attr(''),
      value: this.attr(''),
      state: this.attr(''),
      prefered: this.boolean(true),
      identifier_type_id: this.attr(''),
      service_id: this.attr(''),
      patient_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      identifierType: this.belongsTo(IdentifierType, 'identifier_type_id'),
      service: this.belongsTo(ClinicalService, 'service_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
      episodes: this.hasMany(Episode, 'patientServiceIdentifier_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
