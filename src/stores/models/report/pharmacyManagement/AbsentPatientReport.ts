import { Model } from 'pinia-orm';

export default class AbsentPatientReport extends Model {
  static entity = 'absentPatientReports';
  static fields() {
    return {
      id: this.attr(null),
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
      name: this.attr(''),
      cellphone: this.attr(''),
      // dateBackUs: this.attr(''),
      dateMissedPickUp: this.attr(''),
      dateIdentifiedAbandonment: this.attr(''),
      returnedPickUp: this.attr(''),
    };
  }
}
