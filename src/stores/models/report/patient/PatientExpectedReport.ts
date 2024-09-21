import { v4 as uuidv4 } from 'uuid';
import { Model } from 'pinia-orm';

export default class PatientExpectedReport extends Model {
  static entity = 'patientsExpectedReport';
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
      firstNames: this.attr(''),
      middleNames: this.attr(''),
      lastNames: this.attr(''),
      pickUpDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      therapeuticRegimen: this.attr(''),
      dispenseType: this.attr(''),
      clinicalService: this.attr(''),
      clinicSectorName: this.attr(''),
    };
  }
}
