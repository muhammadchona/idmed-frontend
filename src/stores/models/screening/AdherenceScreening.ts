import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import { v4 as uuidv4 } from 'uuid';

export default class AdherenceScreening extends Model {
  static entity = 'adherenceScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      hasPatientCameCorrectDate: this.attr(''),
      daysWithoutMedicine: this.attr(''),
      patientForgotMedicine: this.attr(''),
      lateDays: this.attr(''),
      lateMotives: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
