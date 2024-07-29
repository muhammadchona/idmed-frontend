import { Model } from 'pinia-orm';
import Stock from '../stock/Stock';
import { v4 as uuidv4 } from 'uuid';
import Drug from '../drug/Drug';

export default class StockLevel extends Model {
  static entity = 'stockLevels';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      drug_id: this.attr(null),
      clinic_id: this.attr(null),
      quantity: this.attr(''),
      // relationships
      clinic: this.belongsTo(Stock, 'clinic_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
