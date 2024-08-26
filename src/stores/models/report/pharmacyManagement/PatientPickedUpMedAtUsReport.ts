import { v4 as uuidv4 } from 'uuid';
import { Model } from 'pinia-orm';

export default class PatientPickedUpMedAtUsReport extends Model {
  static entity = 'patientPickedUpMedAtUsReport';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      reportId: this.attr(''),
      periodType: this.attr(''),
      period: this.attr(''),
      year: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(''),
      province: this.attr(''),
      district: this.attr(''),

      // fields
      nid: this.attr(''),
      fullName: this.attr(''),
      pickUpDate: this.attr(''),
      nexPickUpDate: this.attr(''),
      therapeuticalRegimen: this.attr(''),
      dispenseType: this.attr(''),
      dispenseMode: this.attr(''),
      clinicalService: this.attr(''),
      clinic: this.attr(''),
    };
  }
}
