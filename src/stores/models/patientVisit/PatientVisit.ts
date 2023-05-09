import { Model } from 'pinia-orm';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import PregnancyScreening from '../screening/PregnancyScreening';
import RAMScreening from '../screening/RAMScreening';
import TBScreening from '../screening/TBScreening';
import AdherenceScreening from '../screening/AdherenceScreening';
import VitalSignsScreening from '../screening/VitalSignsScreening';
import Patient from '../patient/Patient';
import Clinic from '../clinic/Clinic';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientVisit extends Model {
  static entity = 'patientVisits';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      visitDate: this.attr(''),
      clinic_id: this.attr(''),
      patient_id: this.attr(''),
      isLast: this.boolean(false),
      syncStatus: this.attr(''),
      // Relationships
      patientVisitDetails: this.hasMany(
        PatientVisitDetails,
        'patient_visit_id'
      ),
      vitalSigns: this.hasMany(VitalSignsScreening, 'patient_visit_id'),
      tbScreening: this.hasMany(TBScreening, 'patient_visit_id'),
      pregnancyScreening: this.hasMany(PregnancyScreening, 'patient_visit_id'),
      adherenceScreening: this.hasMany(AdherenceScreening, 'patient_visit_id'),
      ramScreening: this.hasMany(RAMScreening, 'patient_visit_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
    };
  }
}
