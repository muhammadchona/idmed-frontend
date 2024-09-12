import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import Pack from '../packaging/Pack';
import Prescription from '../prescription/Prescription';
import PatientVisit from '../patientVisit/PatientVisit';
import { Clinic } from '../clinic/ClinicHierarchy';
import { v4 as uuidv4 } from 'uuid';

export default class PatientVisitDetails extends Model {
  static entity = 'patientVisitDetails';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      patient_visit_id: this.attr(''),
      episode_id: this.attr(''),
      clinic_id: this.attr(''),
      createPackLater: this.boolean(false),
      prescription_id: this.attr(''),
      pack_id: this.attr(''),
      syncStatus: this.attr(''),
      patientVisitId: this.attr(''),
      origin: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      pack: this.belongsTo(Pack, 'pack_id'),
      episode: this.belongsTo(Episode, 'episode_id'),
      patientVisit: this.belongsTo(PatientVisit, 'patient_visit_id'),
      prescription: this.belongsTo(Prescription, 'prescription_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
