import { Model } from 'pinia-orm';

export default class PatientsWithPregnancyScreening extends Model {
  static entity = 'patientsWithPregnancyScreenings';
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
      firstNames: this.attr(''),
      middleNames: this.attr(''),
      lastNames: this.attr(''),
      age: this.attr(''),
      gender: this.attr(''),
      visitDate: this.attr(''),
      clinic: this.attr(''),
      isPregnant: this.attr(''),
    };
  }
}
