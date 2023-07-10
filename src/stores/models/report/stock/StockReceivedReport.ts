
import { v4 as uuidv4 } from 'uuid'
import { Model } from 'pinia-orm';

export default class StockReceivedReport  extends Model {
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
