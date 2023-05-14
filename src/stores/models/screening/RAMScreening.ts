import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import { v4 as uuidv4 } from 'uuid';

export default class RAMScreening extends Model {
  static entity = 'RAMScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      adverseReaction: this.attr(''),
      adverseReactionMedicine: this.attr(''),
      //  referedToUSRam: this.attr(''),
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
