// import { Model } from 'pinia-orm'
import db from 'src/stores/localbase';

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

  static localDbAdd(stockUsedReport) {
    return db.newDb().collection('stockUsedReports').add(stockUsedReport);
  }

  static localDbGetAll() {
    //
    return db.newDb().collection('stockUsedReports').get();
  }

  static localDbUpdateAll(stockUsedReport) {
    return db.newDb().collection('stockUsedReports').set(stockUsedReport);
  }

  static localDbDeleteAll() {
    return db.newDb().collection('stockUsedReports').delete();
  }

  static localDbDeleteById(id) {
    return db.newDb().collection('stockUsedReports').doc({ id: id }).delete();
  }
}
