import { Model } from 'pinia-orm';

export default class PatientsWithScreeningReport extends Model {
  static entity = 'patientsWithScreeningReports';
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
      gender: this.attr(''),
      age: this.attr(''),
      visitDate: this.attr(''),
      clinic: this.attr(''),
      wasTBScreened: this.attr(''),
      wasRAMScreened: this.attr(''),
      isPregnant: this.attr(''),
    };
  }
}
