import { Model } from 'pinia-orm';
import { Clinic } from '../clinic/ClinicHierarchy';
import Doctor from '../doctor/Doctor';
import Duration from '../duration/Duration';
import GroupMemberPrescription from '../group/GroupMemberPrescription';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import PrescriptionDetail from '../prescriptionDetails/PrescriptionDetail';
import PrescribedDrug from '../prescriptionDrug/PrescribedDrug';
import { v4 as uuidv4 } from 'uuid';

export default class Prescription extends Model {
  static entity = 'prescriptions';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      duration_id: this.attr(''),
      prescriptionDate: this.attr(''),
      expiryDate: this.attr(''),
      current: this.boolean(true),
      notes: this.attr(''),
      prescriptionSeq: this.attr(''),
      modified: this.boolean(false),
      patientType: this.attr(''),
      patientStatus: this.attr(''),
      leftDuration: this.attr(0),
      doctor_id: this.attr(''),
      clinic_id: this.attr(''),
      special: this.boolean(false),
      syncStatus: this.attr(''),
      origin: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      doctor: this.belongsTo(Doctor, 'doctor_id'),
      patientVisitDetails: this.hasMany(PatientVisitDetails, 'prescription_id'),
      prescriptionDetails: this.hasMany(
        PrescriptionDetail,
        'prescription_id'
      ).onDelete('cascade'),
      duration: this.belongsTo(Duration, 'duration_id'),
      prescribedDrugs: this.hasMany(PrescribedDrug, 'prescription_id').onDelete(
        'cascade'
      ),
      groupMemberPrescription: this.hasMany(
        GroupMemberPrescription,
        'prescription_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
