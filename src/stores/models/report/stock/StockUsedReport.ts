// import { Model } from 'pinia-orm'

export default class StockUsedReport {
  static entity = 'stockUsedReports';
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
      fnmCode: this.attr(''),
      // drugId: this.attr(''),
      drugName: this.attr(''),
      balance: this.attr(''),
      receivedStock: this.attr(0),
      stockIssued: this.attr(0),
      adjustment: this.attr(0),
      actualStock: this.attr(0),
    };
  }

}
