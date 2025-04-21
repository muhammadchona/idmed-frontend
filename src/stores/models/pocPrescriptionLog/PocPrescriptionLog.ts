import { Model } from 'pinia-orm';
import Prescription from '../prescription/Prescription';
import { v4 as uuidv4 } from 'uuid';
import ClinicalService from '../ClinicalService/ClinicalService';
import Patient from '../patient/Patient';

export default class PocPrescriptionLog extends Model {
  static entity = 'pocPrescriptionLogs';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      clinical_service_id: this.attr(''),
      patient_id: this.attr(''),
      prescription_id: this.attr(''),
      prescriptionDate: this.attr(''),
      nid: this.attr(''),
      status: this.attr(''),
      messageId: this.attr(''),
      // Relationships
      clinicalService: this.belongsTo(ClinicalService, 'clinical_service_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
      prescription: this.belongsTo(Prescription, 'prescription_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
