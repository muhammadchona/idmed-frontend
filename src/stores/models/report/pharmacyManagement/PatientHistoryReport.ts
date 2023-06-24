

export default class patientHistoryReport {
  static entity = 'patientHistorys';
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
      cellphone: this.attr(''),
      tipoTarv: this.attr(''),
      pickUpDate: this.attr(''),
      nexPickUpDate: this.attr(''),
      startReason: this.attr(''),
      therapeuticalRegimen: this.attr(''),
      dispenseType: this.attr(''),
      age: this.attr(''),
      dispenseMode: this.attr(''),
      clinicalService: this.attr(''),
      clinic: this.attr(''),
      patientType: this.attr(''),
    };
  }

}
