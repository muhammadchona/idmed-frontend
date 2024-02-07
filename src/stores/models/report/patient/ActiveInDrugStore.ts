import { Model } from 'pinia-orm';

export default class ActiveInDrugStore extends Model {
  static entity = 'activeInDrugStores';
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
      cellphone: this.attr(''),
      patientType: this.attr(''),
      therapeuticLine: this.attr(''),
      therapeuticRegimen: this.attr(''),
      pickupDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      prescriptionDate: this.attr(''),
    };
  }


}
