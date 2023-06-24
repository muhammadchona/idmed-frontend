import { Model } from 'pinia-orm';

export default class StockAlert extends Model {
  static entity = 'stockAlerts';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      drug: this.attr(''),
      balance: this.attr(''),
      avgConsuption: this.attr(''),
      state: this.attr(''),
    };
  }
}
