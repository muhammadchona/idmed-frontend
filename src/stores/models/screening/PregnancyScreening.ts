import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import { v4 as uuidv4 } from 'uuid';

export default class PregnancyScreening extends Model {
  static entity = 'pregnancyScreenings';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      pregnant: this.attr(''),
      menstruationLastTwoMonths: this.attr(''),
      lastMenstruation: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      origin: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
