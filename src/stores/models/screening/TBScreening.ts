import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import { v4 as uuidv4 } from 'uuid';

export default class TBScreening extends Model {
  static entity = 'TBScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      parentTBTreatment: this.attr(''),
      cough: this.attr(''),
      fever: this.attr(''),
      losingWeight: this.attr(''),
      treatmentTB: this.attr(''),
      treatmentTPI: this.attr(''),
      // referedToUSTB: this.attr(''),
      startTreatmentDate: this.attr(''),
      fatigueOrTirednessLastTwoWeeks: this.attr(''),
      sweating: this.attr(''),
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
