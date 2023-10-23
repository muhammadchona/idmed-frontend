import { Model } from 'pinia-orm';

export default class ReferredPatientsReport extends Model {
  static entity = 'referredPatientsReports';
  static fields() {
    return {
      id: this.attr(null),
      reportId: this.attr(''),
      pharmacyId: this.attr(''),
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
      age: this.attr(''),
      cellphone: this.attr(''),
      patientType: this.attr(''),
      therapeuticLine: this.attr(''),
      therapeuticRegimen: this.attr(''),
      pickupDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      lastPrescriptionDate: this.attr(''),
      dispenseType: this.attr(''),
      referrenceDate: this.attr(''),
      referralPharmacy: this.attr(''),
      notes: this.attr(''),
    };
  }
}
