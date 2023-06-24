import { Model } from 'pinia-orm';
import Stock from '../stock/Stock';
import { v4 as uuidv4 } from 'uuid';

export default class StockLevel extends Model {
  static entity = 'stockLevels';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      bacth: this.attr(null),
      fullContainerRemaining: this.attr(null),
      loosePillsRemaining: this.attr(null),
      stock_id: this.attr(null),
      syncStatus: this.attr(''),
      // relationships
      stock: this.belongsTo(Stock, 'stock_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
