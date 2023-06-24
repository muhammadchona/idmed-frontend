

export default class StockReceivedReport {
  static entity = 'stockReceivedReports';
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
      orderNumber: this.attr(''),
      drugName: this.attr(''),
      expiryDate: this.attr(''),
      dateReceived: this.attr(''),
      unitsReceived: this.attr(''),
      manufacture: this.attr(''),
      batchNumber: this.attr(''),
    };
  }

}
